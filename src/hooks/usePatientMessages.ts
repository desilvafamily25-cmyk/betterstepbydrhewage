import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { PatientMessage, PatientMessagePriority, PatientMessageStatus } from '../types';

function dbMessage(row: Record<string, unknown>): PatientMessage {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    clinicianId: row.clinician_id as string,
    subject: row.subject as string,
    body: row.body as string,
    priority: (row.priority as PatientMessagePriority) ?? 'normal',
    status: (row.status as PatientMessageStatus) ?? 'unread',
    createdAt: row.created_at as string,
    readAt: (row.read_at as string | null) ?? null,
    archivedAt: (row.archived_at as string | null) ?? null,
  };
}

export function usePatientMessages() {
  const { patientId } = useAuth();
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!patientId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('patient_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    setMessages((data ?? []).map(row => dbMessage(row as Record<string, unknown>)));
    setLoading(false);
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: PatientMessageStatus) => {
    const patch: Record<string, string | null> = { status };
    if (status === 'read') patch.read_at = new Date().toISOString();
    if (status === 'archived') patch.archived_at = new Date().toISOString();

    setMessages(prev => prev.map(message => (
      message.id === id
        ? {
            ...message,
            status,
            readAt: status === 'read' ? patch.read_at : message.readAt,
            archivedAt: status === 'archived' ? patch.archived_at : message.archivedAt,
          }
        : message
    )));

    await supabase.from('patient_messages').update(patch).eq('id', id);
  };

  return {
    messages,
    loading,
    unreadCount: messages.filter(message => message.status === 'unread').length,
    markAsRead: (id: string) => updateStatus(id, 'read'),
    archiveMessage: (id: string) => updateStatus(id, 'archived'),
    reload: load,
  };
}

export function useClinicianMessages(patientId?: string) {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!patientId || role !== 'clinician') {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('patient_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5);

    setMessages((data ?? []).map(row => dbMessage(row as Record<string, unknown>)));
    setLoading(false);
  }, [patientId, role]);

  useEffect(() => { load(); }, [load]);

  const sendMessage = async (message: {
    subject: string;
    body: string;
    priority: PatientMessagePriority;
  }) => {
    if (!patientId || !user || role !== 'clinician') return { error: new Error('Not authorised') };

    const { data, error } = await supabase
      .from('patient_messages')
      .insert({
        patient_id: patientId,
        clinician_id: user.id,
        subject: message.subject,
        body: message.body,
        priority: message.priority,
      })
      .select()
      .single();

    if (data) setMessages(prev => [dbMessage(data as Record<string, unknown>), ...prev]);
    return { data, error };
  };

  return { messages, loading, sendMessage, reload: load };
}
