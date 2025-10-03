import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  userId: string;
  aqiValue: number;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, aqiValue, location }: AlertRequest = await req.json();

    console.log(`Processing alert for user ${userId}, AQI: ${aqiValue}, Location: ${location}`);

    // Fetch user's alert settings
    const { data: settings, error: settingsError } = await supabase
      .from('alert_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching alert settings:', settingsError);
      throw new Error('Failed to fetch alert settings');
    }

    if (!settings) {
      return new Response(
        JSON.stringify({ message: 'No alert settings found for user' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if AQI exceeds threshold
    if (aqiValue < settings.threshold) {
      return new Response(
        JSON.stringify({ message: 'AQI below threshold, no alert sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const alertMessage = `Air Quality Alert: AQI in ${location} is ${aqiValue}, which exceeds your threshold of ${settings.threshold}.`;
    const results: any = {
      email: null,
      sms: null,
      push: null
    };

    // Send email alert if enabled
    if (settings.email_enabled && settings.email) {
      console.log(`[PLACEHOLDER] Would send email to: ${settings.email}`);
      console.log(`[PLACEHOLDER] Email content: ${alertMessage}`);
      
      // TODO: Replace with actual email sending API
      // Example: await sendEmail(settings.email, 'Air Quality Alert', alertMessage);
      
      results.email = {
        sent: true,
        recipient: settings.email,
        message: 'Email sending API placeholder - integrate your own API here'
      };
    }

    // Send SMS alert if enabled
    if (settings.sms_enabled && settings.phone) {
      console.log(`[PLACEHOLDER] Would send SMS to: ${settings.phone}`);
      console.log(`[PLACEHOLDER] SMS content: ${alertMessage}`);
      
      // TODO: Replace with actual SMS sending API
      // Example: await sendSMS(settings.phone, alertMessage);
      
      results.sms = {
        sent: true,
        recipient: settings.phone,
        message: 'SMS sending API placeholder - integrate your own API here'
      };
    }

    // Send push notification if enabled
    if (settings.push_enabled) {
      console.log(`[PLACEHOLDER] Would send push notification to user: ${userId}`);
      console.log(`[PLACEHOLDER] Push content: ${alertMessage}`);
      
      // TODO: Replace with actual push notification API
      // Example: await sendPushNotification(userId, 'Air Quality Alert', alertMessage);
      
      results.push = {
        sent: true,
        userId: userId,
        message: 'Push notification API placeholder - integrate your own API here'
      };
    }

    console.log('Alert processing completed:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alerts processed',
        results 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-alert function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
