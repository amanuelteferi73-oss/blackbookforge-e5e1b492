import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VAULT_REWARDS, VaultReward } from '@/lib/vaultRewards';

export interface VaultAssetState {
  rewardId: number;
  isUnlocked: boolean;
  proofUploaded: boolean;
  unlockedAt: string | null;
  proofText: string | null;
  proofReflection: string | null;
}

export interface UseVaultAssetsResult {
  assets: Map<number, VaultAssetState>;
  isLoading: boolean;
  submitProof: (rewardId: number, anchorText: string, reflectionText: string) => Promise<boolean>;
  claimReward: (rewardId: number) => Promise<boolean>;
  getAssetState: (rewardId: number) => VaultAssetState;
  refresh: () => Promise<void>;
}

export function useVaultAssets(): UseVaultAssetsResult {
  const [assets, setAssets] = useState<Map<number, VaultAssetState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const loadAssets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all assets for this user in the 'reward' category
      const { data: dbAssets, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_unlock_status(unlocked_at, unlock_reason)
        `)
        .eq('user_id', user.id)
        .eq('category', 'reward');

      if (error) {
        console.error('Error loading vault assets:', error);
        setIsLoading(false);
        return;
      }

      const assetMap = new Map<number, VaultAssetState>();

      // Initialize all rewards as locked
      VAULT_REWARDS.forEach(reward => {
        assetMap.set(reward.id, {
          rewardId: reward.id,
          isUnlocked: false,
          proofUploaded: false,
          unlockedAt: null,
          proofText: null,
          proofReflection: null,
        });
      });

      // Update with actual data from database
      dbAssets?.forEach(asset => {
        const rewardId = parseInt(asset.name || '0', 10);
        if (rewardId > 0) {
          const unlockStatus = asset.asset_unlock_status;
          // Parse content as JSON to extract proof text fields
          let proofText = null;
          let proofReflection = null;
          if (asset.content) {
            try {
              const parsed = JSON.parse(asset.content);
              proofText = parsed.anchorText || null;
              proofReflection = parsed.reflectionText || null;
            } catch {
              // If not JSON, content is just the title (old format)
            }
          }
          assetMap.set(rewardId, {
            rewardId,
            isUnlocked: !!unlockStatus,
            proofUploaded: !!asset.content && (proofText !== null || asset.file_path !== null),
            unlockedAt: unlockStatus?.unlocked_at || null,
            proofText,
            proofReflection,
          });
        }
      });

      setAssets(assetMap);
    } catch (err) {
      console.error('Error in loadAssets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const submitProof = async (rewardId: number, anchorText: string, reflectionText: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const reward = VAULT_REWARDS.find(r => r.id === rewardId);
      if (!reward) return false;

      // Store proof text as JSON in content field
      const proofContent = JSON.stringify({
        anchorText,
        reflectionText,
        submittedAt: new Date().toISOString(),
        rewardTitle: reward.title,
      });

      // Check if asset record already exists
      const { data: existingAsset } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'reward')
        .eq('name', rewardId.toString())
        .maybeSingle();

      if (existingAsset) {
        // Update existing asset
        await supabase
          .from('assets')
          .update({ content: proofContent })
          .eq('id', existingAsset.id);
      } else {
        // Create new asset record
        await supabase
          .from('assets')
          .insert({
            user_id: user.id,
            category: 'reward',
            type: 'message',
            name: rewardId.toString(),
            content: proofContent,
          });
      }

      // Update local state
      setAssets(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(rewardId) || {
          rewardId,
          isUnlocked: false,
          proofUploaded: false,
          unlockedAt: null,
          proofText: null,
          proofReflection: null,
        };
        newMap.set(rewardId, {
          ...current,
          proofUploaded: true,
          proofText: anchorText,
          proofReflection: reflectionText,
        });
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error submitting proof:', err);
      return false;
    }
  };

  const claimReward = async (rewardId: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the asset record
      const { data: asset } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'reward')
        .eq('name', rewardId.toString())
        .maybeSingle();

      if (!asset) {
        console.error('Asset not found for reward:', rewardId);
        return false;
      }

      // Create unlock status
      const { error: unlockError } = await supabase
        .from('asset_unlock_status')
        .insert({
          asset_id: asset.id,
          unlock_reason: 'Text proof submitted',
        });

      if (unlockError) {
        console.error('Error creating unlock status:', unlockError);
        return false;
      }

      // Update local state
      setAssets(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(rewardId);
        if (current) {
          newMap.set(rewardId, {
            ...current,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          });
        }
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error claiming reward:', err);
      return false;
    }
  };

  const getAssetState = (rewardId: number): VaultAssetState => {
    return assets.get(rewardId) || {
      rewardId,
      isUnlocked: false,
      proofUploaded: false,
      unlockedAt: null,
      proofText: null,
      proofReflection: null,
    };
  };

  return {
    assets,
    isLoading,
    submitProof,
    claimReward,
    getAssetState,
    refresh: loadAssets,
  };
}