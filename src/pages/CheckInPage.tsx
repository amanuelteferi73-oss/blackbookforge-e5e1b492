import { EnforcementCheckIn } from '@/components/enforcement/EnforcementCheckIn';

export default function CheckInPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6 max-w-2xl">
        <EnforcementCheckIn />
      </div>
    </div>
  );
}
