import { Bell, CheckCircle, X } from 'lucide-react';
import type { Reminder } from '../types';
import { formatDate, daysUntil } from '../utils';
import clsx from 'clsx';

interface ReminderCardProps {
  reminder: Reminder;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const typeLabels: Record<Reminder['type'], string> = {
  'weight-check': 'Weight Check',
  'medication-dose': 'Medication Dose',
  'gp-review': 'GP Review',
  'prescription-review': 'Prescription Review',
  'pathology': 'Pathology',
  'lifestyle': 'Lifestyle Focus',
};

export function ReminderCard({ reminder, onAcknowledge, onDismiss }: ReminderCardProps) {
  const days = daysUntil(reminder.dueDate);
  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 3;
  const isDone = reminder.status !== 'pending';

  return (
    <div className={clsx(
      'rounded-2xl border p-4 flex gap-3 shadow-sm',
      isDone ? 'bg-[#F6F3EE] border-[#E7E5E1] opacity-60' :
      isOverdue ? 'bg-red-50 border-red-200' :
      isUrgent ? 'bg-[#DCC9B0]/35 border-[#DCC9B0]' :
      'bg-white border-[#E7E5E1]'
    )}>
      <Bell size={18} className={clsx(
        'flex-shrink-0 mt-0.5',
        isDone ? 'text-[#9AA09D]' :
        isOverdue ? 'text-red-500' :
        isUrgent ? 'text-[#B8735E]' : 'text-[#1B3D34]'
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-[#3C4346] uppercase tracking-wide">
              {typeLabels[reminder.type]}
            </span>
            <p className="text-sm font-medium text-[#1B3D34] leading-snug mt-0.5">{reminder.message}</p>
            <p className="text-xs text-[#747B7D] mt-1">
              {isOverdue ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue` :
               days === 0 ? 'Due today' :
               `Due ${formatDate(reminder.dueDate)} (${days} day${days !== 1 ? 's' : ''})`}
            </p>
          </div>
        </div>
        {!isDone && (
          <div className="flex gap-2 mt-3">
            {onAcknowledge && (
              <button onClick={() => onAcknowledge(reminder.id)}
                className="flex items-center gap-1 text-xs font-medium text-[#1B3D34] bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-lg px-3 py-1.5">
                <CheckCircle size={13} /> Done
              </button>
            )}
            {onDismiss && (
              <button onClick={() => onDismiss(reminder.id)}
                className="flex items-center gap-1 text-xs font-medium text-[#3C4346] bg-[#F6F3EE] border border-[#E7E5E1] rounded-lg px-3 py-1.5">
                <X size={13} /> Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
