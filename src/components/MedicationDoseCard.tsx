import { useState } from 'react';
import { Pill, CheckCircle2 } from 'lucide-react';
import type { Medication } from '../types';
import { daysUntil } from '../utils';

interface Props {
  medication: Medication;
  onLogDose: (id: string, nextDoseDate: string, medicationDay: string) => Promise<void>;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDayAndDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function MedicationDoseCard({ medication, onLogDose }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [takenDate, setTakenDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);

  const daysToNext = daysUntil(medication.nextDoseDate);
  const isOverdue = daysToNext < 0;
  const isDueToday = daysToNext === 0;
  const isDaily = medication.frequency === 'Daily injection';
  const daysInterval = isDaily ? 1 : 7;

  const handleConfirm = async () => {
    if (!takenDate) return;
    setSaving(true);
    const nextDate = addDays(takenDate, daysInterval);
    const [y, m, d] = nextDate.split('-').map(Number);
    const nextDay = isDaily ? 'Daily' : DAY_NAMES[new Date(y, m - 1, d).getDay()];
    await onLogDose(medication.id, nextDate, nextDay);
    setSaving(false);
    setConfirming(false);
    setTakenDate(todayStr());
  };

  const headerBg = isOverdue ? 'bg-red-500' : 'bg-[#1B3D34]';

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${isOverdue ? 'border-red-200' : 'border-[#E7E5E1]'}`}>
      {/* Header bar */}
      <div className={`${headerBg} px-4 py-3 flex items-center gap-3`}>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Pill size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">{medication.name}</p>
          <p className="text-white/80 text-xs">{medication.dose} · {medication.frequency}</p>
        </div>
        {isOverdue && (
          <span className="bg-white text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            OVERDUE
          </span>
        )}
        {isDueToday && (
          <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            DUE TODAY
          </span>
        )}
      </div>

      <div className="bg-white px-4 py-3 space-y-3">
        {/* Due date info */}
        <div>
          <p className="text-xs text-[#747B7D] font-medium">
            {isOverdue ? 'Was due' : isDueToday ? 'Due' : 'Next dose due'}
          </p>
          <p className={`text-sm font-bold mt-0.5 ${isOverdue ? 'text-red-600' : 'text-[#1B3D34]'}`}>
            {formatDayAndDate(medication.nextDoseDate)}
          </p>
          {isOverdue && (
            <p className="text-xs text-red-500 mt-0.5">
              {Math.abs(daysToNext)} day{Math.abs(daysToNext) !== 1 ? 's' : ''} overdue
            </p>
          )}
          {!isOverdue && !isDueToday && (
            <p className="text-xs text-[#747B7D] mt-0.5">
              in {daysToNext} day{daysToNext !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Action area */}
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              isOverdue
                ? 'bg-red-500 text-white'
                : 'bg-[#1B3D34] text-white'
            }`}
          >
            <CheckCircle2 size={15} />
            {isOverdue ? 'Log late dose' : isDueToday ? "Confirm today's dose" : 'Confirm dose taken'}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#3C4346] uppercase tracking-wide">
              When did you take it?
            </p>
            <input
              type="date"
              value={takenDate}
              onChange={e => setTakenDate(e.target.value)}
              className="w-full rounded-xl border border-[#E7E5E1] bg-[#F6F3EE] px-4 py-2.5 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]"
            />
            {takenDate && (
              <p className="text-xs text-[#747B7D]">
                Next dose will be set to: <span className="font-semibold text-[#1B3D34]">{formatDayAndDate(addDays(takenDate, daysInterval))}</span>
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setConfirming(false); setTakenDate(todayStr()); }}
                className="flex-1 rounded-xl border border-[#E7E5E1] py-2.5 text-sm font-medium text-[#3C4346]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || !takenDate}
                className="flex-1 rounded-xl bg-[#1B3D34] text-white py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
