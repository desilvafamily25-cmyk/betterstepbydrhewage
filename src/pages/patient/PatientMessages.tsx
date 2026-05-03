import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { usePatientMessages } from '../../hooks/usePatientMessages';
import type { PatientMessage, PatientMessagePriority } from '../../types';
import { AlertTriangle, Archive, ChevronDown, ChevronUp, Mail, Clock } from 'lucide-react';
import clsx from 'clsx';

const priorityStyles: Record<PatientMessagePriority, { label: string; className: string }> = {
  normal: { label: 'Routine', className: 'bg-[#E7E5E1] text-[#3C4346]' },
  important: { label: 'Important', className: 'bg-[#DCC9B0]/45 text-[#8A4D3C]' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
};

function formatMessageDate(value: string) {
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MessageCard({
  message,
  isOpen,
  onOpen,
  onArchive,
}: {
  message: PatientMessage;
  isOpen: boolean;
  onOpen: () => void;
  onArchive: () => void;
}) {
  const priority = priorityStyles[message.priority];

  return (
    <div className={clsx(
      'rounded-2xl border bg-white shadow-sm overflow-hidden',
      message.priority === 'urgent' ? 'border-red-200' : 'border-[#E7E5E1]'
    )}>
      <button
        onClick={onOpen}
        className="w-full px-4 py-4 text-left flex items-start gap-3"
      >
        <div className={clsx(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          message.status === 'unread' ? 'bg-[#1B3D34]/10 text-[#1B3D34]' : 'bg-[#F6F3EE] text-[#747B7D]'
        )}>
          <Mail size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', priority.className)}>
              {priority.label}
            </span>
            {message.status === 'unread' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0F6D6D]/10 text-[#0F6D6D]">
                New
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#1B3D34] mt-2 leading-snug">{message.subject}</p>
          <p className="text-xs text-[#747B7D] mt-1">{formatMessageDate(message.createdAt)}</p>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-[#747B7D] mt-1" /> : <ChevronDown size={18} className="text-[#747B7D] mt-1" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#E7E5E1]">
          <p className="text-sm text-[#3C4346] leading-relaxed whitespace-pre-line pt-4">{message.body}</p>
          <button
            onClick={onArchive}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#E7E5E1] bg-[#F6F3EE] px-3 py-2 text-xs font-semibold text-[#3C4346]"
          >
            <Archive size={13} />
            Archive
          </button>
        </div>
      )}
    </div>
  );
}

export function PatientMessages() {
  const { messages, loading, unreadCount, markAsRead, archiveMessage } = usePatientMessages();
  const [openId, setOpenId] = useState<string | null>(null);
  const visibleMessages = messages.filter(message => message.status !== 'archived');

  const openMessage = (message: PatientMessage) => {
    setOpenId(openId === message.id ? null : message.id);
    if (message.status === 'unread') markAsRead(message.id);
  };

  if (loading) {
    return (
      <AppShell role="patient" title="Messages" showBack>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="patient" title="Messages" showBack>
      <div className="space-y-5">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 leading-relaxed">
            <strong>Emergency?</strong> Call <strong>000</strong> or attend your nearest emergency department immediately. Do not wait for a message reply.
          </p>
        </div>

        <div className="flex items-start gap-3 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
          <Clock size={16} className="text-[#0F6D6D] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#0F6D6D] leading-relaxed">
            Dr. Hewage typically responds within <strong>1 working day</strong>. Messages are not monitored outside clinic hours or on weekends.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1B3D34]">Clinic Messages</h2>
            <p className="text-sm text-[#3C4346]">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'No unread messages'}
            </p>
          </div>
        </div>

        {visibleMessages.length === 0 ? (
          <div className="text-center py-12 text-[#747B7D]">
            <Mail size={34} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No clinic messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleMessages.map(message => (
              <MessageCard
                key={message.id}
                message={message}
                isOpen={openId === message.id}
                onOpen={() => openMessage(message)}
                onArchive={() => archiveMessage(message.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
