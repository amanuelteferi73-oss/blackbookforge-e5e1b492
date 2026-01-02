import { CoreStatement } from '@/components/CoreStatement';
import { StatusPanel } from '@/components/StatusPanel';
import { PastSelfGallery } from '@/components/PastSelfGallery';
import { VaultPreview } from '@/components/VaultPreview';
import { LegacyLock } from '@/components/LegacyLock';

const Index = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Core Statement */}
      <CoreStatement />

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-6">
        {/* Status Panel */}
        <StatusPanel />

        {/* Reality State - Past Self */}
        <PastSelfGallery />

        {/* Vault Preview */}
        <VaultPreview />

        {/* Legacy Lock */}
        <LegacyLock />
      </div>
    </div>
  );
};

export default Index;
