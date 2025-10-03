import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useAlertSettings } from '@/hooks/useAlertSettings';

const AlertSettings = () => {
  const { settings, setSettings, saveSettings, isLoading, isSaving } = useAlertSettings();

  const handleSave = async () => {
    await saveSettings(settings);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Alert Settings</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Alert Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-sm font-medium mb-2 block">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Required for email alerts
          </p>
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional, for SMS alerts
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Notification Channels</Label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push" className="cursor-pointer">Push Notifications</Label>
              </div>
              <Switch
                id="push"
                checked={settings.push_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, push_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email-enabled" className="cursor-pointer">Email Alerts</Label>
              </div>
              <Switch
                id="email-enabled"
                checked={settings.email_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, email_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="sms" className="cursor-pointer">SMS Alerts</Label>
              </div>
              <Switch
                id="sms"
                checked={settings.sms_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, sms_enabled: checked })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="threshold" className="text-sm font-medium mb-2 block">
            Alert Threshold (AQI)
          </Label>
          <Input
            id="threshold"
            type="number"
            value={settings.threshold}
            onChange={(e) => setSettings({ ...settings, threshold: parseInt(e.target.value) || 0 })}
            min="0"
            max="500"
          />
          <p className="text-xs text-muted-foreground mt-2">
            You'll be notified when AQI exceeds this value
          </p>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>

        {settings.email && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Recent Saved Preference</h4>
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <p><span className="text-muted-foreground">Email:</span> {settings.email}</p>
              {settings.phone && <p><span className="text-muted-foreground">Phone:</span> {settings.phone}</p>}
              <p><span className="text-muted-foreground">Threshold:</span> AQI {settings.threshold}</p>
              <p><span className="text-muted-foreground">Channels:</span> {[
                settings.push_enabled && 'Push',
                settings.email_enabled && 'Email',
                settings.sms_enabled && 'SMS'
              ].filter(Boolean).join(', ') || 'None'}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AlertSettings;
