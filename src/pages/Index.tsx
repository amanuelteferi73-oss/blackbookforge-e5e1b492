import { CoreStatement } from '@/components/CoreStatement';
import { StatusPanel } from '@/components/StatusPanel';
import { FutureSelfGallery } from '@/components/FutureSelfGallery';
import { PastSelfGallery } from '@/components/PastSelfGallery';
import { VaultPreview } from '@/components/VaultPreview';
import { LegacyLock } from '@/components/LegacyLock';
import { ActiveFloorTimer } from '@/components/dashboard/ActiveFloorTimer';

const Index = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0 pt-40 md:pt-24">
      {/* Core Statement */}
      <CoreStatement />

      {/* Active Floor Timer - only shows when timer is running */}
      <ActiveFloorTimer />

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-6">
        {/* Status Panel */}
        <StatusPanel />

        {/* Vision State - Future Self */}
        <FutureSelfGallery />

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
