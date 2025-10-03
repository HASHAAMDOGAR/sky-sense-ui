import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { alertSettingsSchema, type AlertSettingsFormData } from '@/lib/validations/alert-settings';

const AlertSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [alerts, setAlerts] = useState({
    email: '',
    phone: '',
    push: true,
    emailAlerts: false,
    sms: false,
    threshold: 100
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AlertSettingsFormData, string>>>({});

  useEffect(() => {
    loadAlertSettings();
  }, []);

  const loadAlertSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view alert settings.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAlerts({
          email: data.email,
          phone: data.phone || '',
          push: data.push_enabled,
          emailAlerts: data.email_enabled,
          sms: data.sms_enabled,
          threshold: data.threshold
        });
      }
    } catch (error: any) {
      console.error('Error loading alert settings:', error);
      toast({
        title: "Error",
        description: "Failed to load alert settings.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save alert settings.",
          variant: "destructive",
        });
        return;
      }

      const formData: AlertSettingsFormData = {
        email: alerts.email,
        phone: alerts.phone || undefined,
        push_enabled: alerts.push,
        email_enabled: alerts.emailAlerts,
        sms_enabled: alerts.sms,
        threshold: alerts.threshold
      };

      const validationResult = alertSettingsSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof AlertSettingsFormData, string>> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof AlertSettingsFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('alert_settings')
        .upsert({
          user_id: user.id,
          email: validationResult.data.email,
          phone: validationResult.data.phone || null,
          push_enabled: validationResult.data.push_enabled,
          email_enabled: validationResult.data.email_enabled,
          sms_enabled: validationResult.data.sms_enabled,
          threshold: validationResult.data.threshold
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your alert preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving alert settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save alert settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Alert Settings</h3>
        </div>
        <p className="text-muted-foreground">Loading...</p>
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
            value={alerts.email}
            onChange={(e) => setAlerts({ ...alerts, email: e.target.value })}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
            Phone Number (Optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={alerts.phone}
            onChange={(e) => setAlerts({ ...alerts, phone: e.target.value })}
            placeholder="+1234567890"
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
          )}
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
                checked={alerts.push}
                onCheckedChange={(checked) => setAlerts({ ...alerts, push: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="emailAlerts" className="cursor-pointer">Email Alerts</Label>
              </div>
              <Switch
                id="emailAlerts"
                checked={alerts.emailAlerts}
                onCheckedChange={(checked) => setAlerts({ ...alerts, emailAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="sms" className="cursor-pointer">SMS Alerts</Label>
              </div>
              <Switch
                id="sms"
                checked={alerts.sms}
                onCheckedChange={(checked) => setAlerts({ ...alerts, sms: checked })}
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
            value={alerts.threshold}
            onChange={(e) => setAlerts({ ...alerts, threshold: parseInt(e.target.value) || 0 })}
            min="0"
            max="500"
          />
          {errors.threshold && (
            <p className="text-xs text-destructive mt-1">{errors.threshold}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            You'll be notified when AQI exceeds this value
          </p>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </Card>
  );
};

export default AlertSettings;
