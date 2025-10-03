import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { alertSettingsSchema, type AlertSettingsInput } from '@/lib/validations/alertSettings';

export const useAlertSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AlertSettingsInput>({
    email: '',
    phone: '',
    push_enabled: true,
    email_enabled: false,
    sms_enabled: false,
    threshold: 100
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage alert settings.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load alert settings.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setSettings({
          email: data.email,
          phone: data.phone || '',
          push_enabled: data.push_enabled,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          threshold: data.threshold
        });
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AlertSettingsInput) => {
    try {
      setIsSaving(true);

      // Validate input
      const validatedSettings = alertSettingsSchema.parse(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save alert settings.",
          variant: "destructive"
        });
        return false;
      }

      // Upsert settings
      const { error } = await supabase
        .from('alert_settings')
        .upsert({
          user_id: user.id,
          email: validatedSettings.email,
          phone: validatedSettings.phone || null,
          push_enabled: validatedSettings.push_enabled,
          email_enabled: validatedSettings.email_enabled,
          sms_enabled: validatedSettings.sms_enabled,
          threshold: validatedSettings.threshold
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save alert settings.",
          variant: "destructive"
        });
        return false;
      }

      setSettings(validatedSettings);
      toast({
        title: "Settings Saved",
        description: "Your alert preferences have been updated.",
      });
      return true;
    } catch (error: any) {
      console.error('Error in saveSettings:', error);
      if (error.errors) {
        // Zod validation errors
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    saveSettings,
    isLoading,
    isSaving
  };
};
