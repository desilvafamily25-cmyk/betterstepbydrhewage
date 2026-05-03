import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

async function saveSubscription(patientId: string, sub: PushSubscription) {
  const json = sub.toJSON();
  await supabase.from('push_subscriptions').upsert(
    {
      patient_id: patientId,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
    { onConflict: 'patient_id,endpoint' }
  );
}

export type PushPermission = 'unsupported' | 'default' | 'granted' | 'denied';

export function usePushNotifications(patientId: string | undefined) {
  const [permission, setPermission] = useState<PushPermission>('default');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermission);
  }, []);

  // Silently re-save an existing subscription when permission is already granted
  useEffect(() => {
    if (!patientId || permission !== 'granted') return;
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return;

    navigator.serviceWorker.ready.then(async reg => {
      try {
        const existing = await reg.pushManager.getSubscription();
        if (existing) await saveSubscription(patientId, existing);
      } catch (_) { /* ignore */ }
    });
  }, [patientId, permission]);

  const requestPermission = async (): Promise<boolean> => {
    if (!patientId || !('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);
      if (result !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      // Pass VAPID key as a string — the Push API accepts base64url strings directly
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });
      await saveSubscription(patientId, sub);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    }
  };

  return { permission, requestPermission };
}
