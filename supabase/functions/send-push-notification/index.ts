import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@betterstep.com.au';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  try {
    const body = await req.json();
    // Supabase DB webhook sends { type, table, record, old_record, schema }
    const record = body.record as {
      patient_id: string;
      subject?: string;
      priority?: string;
    };

    if (!record?.patient_id) {
      return new Response('No patient_id in record', { status: 400 });
    }

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('patient_id', record.patient_id);

    if (error) throw error;
    if (!subs?.length) return new Response('No subscriptions found', { status: 200 });

    const isUrgent = record.priority === 'urgent';
    const payload = JSON.stringify({
      title: isUrgent ? '⚠ Urgent message from Dr. Hewage' : 'New message from Dr. Hewage',
      body: record.subject ?? 'You have a new clinic message.',
      url: '/patient/messages',
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          .catch(async (err: { statusCode?: number }) => {
            // 410 Gone = subscription expired, clean it up
            if (err?.statusCode === 410) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
            throw err;
          })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    return new Response(JSON.stringify({ sent, total: subs.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-push-notification error:', err);
    return new Response(String(err), { status: 500 });
  }
});
