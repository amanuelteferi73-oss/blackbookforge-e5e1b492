import { DailyCheckIn } from '@/components/DailyCheckIn';
import { useNavigate } from 'react-router-dom';

export default function CheckInPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Could show a toast or redirect
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-6">
        <DailyCheckIn onComplete={handleComplete} />
      </div>
    </div>
  );
}
