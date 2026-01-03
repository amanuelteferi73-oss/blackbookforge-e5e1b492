import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VAULT_REWARDS, VaultReward } from '@/lib/vaultRewards';

export interface VaultAssetState {
  rewardId: number;
  isUnlocked: boolean;
  proofUploaded: boolean;
  unlockedAt: string | null;
  proofPath: string | null;
}

export interface UseVaultAssetsResult {
  assets: Map<number, VaultAssetState>;
  isLoading: boolean;
  uploadProof: (rewardId: number, file: File) => Promise<boolean>;
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
          proofPath: null,
        });
      });

      // Update with actual data from database
      dbAssets?.forEach(asset => {
        const rewardId = parseInt(asset.name || '0', 10);
        if (rewardId > 0) {
          const unlockStatus = asset.asset_unlock_status;
          assetMap.set(rewardId, {
            rewardId,
            isUnlocked: !!unlockStatus,
            proofUploaded: !!asset.file_path,
            unlockedAt: unlockStatus?.unlocked_at || null,
            proofPath: asset.file_path,
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

  const uploadProof = async (rewardId: number, file: File): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const reward = VAULT_REWARDS.find(r => r.id === rewardId);
      if (!reward) return false;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/proofs/reward-${rewardId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vault-proofs')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // If bucket doesn't exist, we'll store without file
      }

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
          .update({ file_path: filePath })
          .eq('id', existingAsset.id);
      } else {
        // Create new asset record
        await supabase
          .from('assets')
          .insert({
            user_id: user.id,
            category: 'reward',
            type: 'image',
            name: rewardId.toString(),
            file_path: filePath,
            content: reward.title,
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
          proofPath: null,
        };
        newMap.set(rewardId, {
          ...current,
          proofUploaded: true,
          proofPath: filePath,
        });
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Error uploading proof:', err);
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
          unlock_reason: 'Manual proof verification',
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
      proofPath: null,
    };
  };

  return {
    assets,
    isLoading,
    uploadProof,
    claimReward,
    getAssetState,
    refresh: loadAssets,
  };
}
