import { Bell, BellOff, CheckCircle, AlertCircle, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    settings,
    enableNotifications,
    disableNotifications,
    testCheckInNotification,
    testDisciplineNotification,
    updateSettings
  } = useNotifications();

  const handleToggle = async () => {
    if (isEnabled) {
      disableNotifications();
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive FORGE notifications."
      });
    } else {
      const success = await enableNotifications();
      if (success) {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive check-in reminders and hourly discipline rules."
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    }
  };

  const handleTestCheckIn = async () => {
    await testCheckInNotification(2);
    toast({
      title: "Test Sent",
      description: "Check-in reminder notification sent."
    });
  };

  const handleTestDiscipline = async () => {
    await testDisciplineNotification();
    toast({
      title: "Test Sent",
      description: "Discipline rule notification sent."
    });
  };

  // Don't show if notifications aren't supported
  if (!isSupported) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellOff className="h-5 w-5 text-destructive" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support notifications. Try using Chrome on Android.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </span>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </CardTitle>
        <CardDescription>
          {isEnabled 
            ? "Receiving check-in reminders and hourly discipline rules"
            : "Enable to receive important FORGE reminders"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm">
          {permission === 'granted' ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Permission granted</span>
            </>
          ) : permission === 'denied' ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Permission denied - check browser settings</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Permission not yet requested</span>
            </>
          )}
        </div>

        {/* Notification type toggles (only show when enabled) */}
        {isEnabled && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Check-In Reminders</span>
              </div>
              <Switch
                checked={settings.checkInReminders}
                onCheckedChange={(checked) => updateSettings({ checkInReminders: checked })}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Alerts at 3h, 2h, and 1h before midnight deadline
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">Hourly Discipline Rules</span>
              </div>
              <Switch
                checked={settings.disciplineReminders}
                onCheckedChange={(checked) => updateSettings({ disciplineReminders: checked })}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Random rule reminder every hour
            </p>
          </div>
        )}

        {/* Test buttons (only show when enabled) */}
        {isEnabled && (
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestCheckIn}
              className="flex-1 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Test Check-In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestDiscipline}
              className="flex-1 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Test Rule
            </Button>
          </div>
        )}

        {/* Last scheduled info */}
        {settings.lastScheduledAt && isEnabled && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            Active since {new Date(settings.lastScheduledAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
