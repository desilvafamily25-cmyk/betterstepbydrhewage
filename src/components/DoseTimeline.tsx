import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TrendingUp, Plus, X } from 'lucide-react';
import type { Medication } from '../types';

interface DoseEntry {
  date: string;
  dose: string;
  medication: string;
  note?: string;
}

const ESCALATION_GUIDE: Record<string, { steps: string[]; interval: string }> = {
  Ozempic: {
    steps: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
    interval: '4 weeks per step',
  },
  Wegovy: {
    steps: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'],
    interval: '4 weeks per step',
  },
  Mounjaro: {
    steps: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'],
    interval: '4 weeks per step',
  },
  Saxenda: {
    steps: ['0.6 mg', '1.2 mg', '1.8 mg', '2.4 mg', '3 mg'],
    interval: 'Weekly escalation',
  },
  Trulicity: {
    steps: ['0.75 mg', '1.5 mg', '3 mg', '4.5 mg'],
    interval: '4 weeks per step',
  },
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function DoseTimeline({ medication }: { medication: Medication }) {
  const [history, setHistory] = useLocalStorage<DoseEntry[]>('bs_dose_history', []);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDose, setFormDose] = useState(medication.dose);
  const [formNote, setFormNote] = useState('');

  const guide = ESCALATION_GUIDE[medication.name];
  const currentStepIdx = guide?.steps.indexOf(medication.dose) ?? -1;
  const nextDose = guide && currentStepIdx >= 0 && currentStepIdx < guide.steps.length - 1
    ? guide.steps[currentStepIdx + 1]
    : null;

  const medHistory = history
    .filter(e => e.medication === medication.name)
    .sort((a, b) => a.date.localeCompare(b.date));

  const logDose = () => {
    if (!formDate || !formDose) return;
    setHistory(prev => [
      ...prev,
      { date: formDate, dose: formDose, medication: medication.name, note: formNote || undefined },
    ]);
    setShowForm(false);
    setFormNote('');
    setFormDose(medication.dose);
    setFormDate(new Date().toISOString().split('T')[0]);
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-2.5 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#0F6D6D] to-[#1B3D34] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Dose Escalation Timeline</p>
          <p className="text-white/70 text-xs">{medication.name} · Current: {medication.dose}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Escalation guide */}
        {guide && (
          <div>
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-2">
              {medication.name} Escalation Schedule
            </p>
            <p className="text-xs text-[#747B7D] mb-2">{guide.interval} · guided by your GP</p>
            <div className="flex items-center gap-1 flex-wrap">
              {guide.steps.map((step, i) => {
                const isCurrent = step === medication.dose;
                const isPast = currentStepIdx >= 0 && i < currentStepIdx;
                const isNext = i === currentStepIdx + 1;
                return (
                  <div key={step} className="flex items-center gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      isCurrent
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                        : isPast
                        ? 'bg-[#0F6D6D]/10 text-[#0F6D6D] border-[#0F6D6D]/30 line-through'
                        : isNext
                        ? 'bg-[#DCC9B0]/40 text-[#8A4D3C] border-[#DCC9B0]'
                        : 'bg-[#F6F3EE] text-[#747B7D] border-[#E7E5E1]'
                    }`}>
                      {step}
                    </span>
                    {i < guide.steps.length - 1 && (
                      <span className="text-[#E7E5E1] text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            {nextDose && (
              <p className="text-xs text-[#8A4D3C] mt-2 bg-[#DCC9B0]/30 border border-[#DCC9B0] rounded-lg px-3 py-2">
                Next planned dose: <strong>{nextDose}</strong> — only increase with GP approval
              </p>
            )}
            {currentStepIdx === (guide.steps.length - 1) && (
              <p className="text-xs text-[#0F6D6D] mt-2 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-lg px-3 py-2">
                You are on the maximum maintenance dose for {medication.name}.
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        {medHistory.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-3">Your Dose History</p>
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#E7E5E1]" />
              <div className="space-y-3">
                {medHistory.map((entry, i) => {
                  const isLatest = i === medHistory.length - 1;
                  return (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className={`absolute -left-3.5 mt-1 w-3 h-3 rounded-full border-2 ${
                        isLatest
                          ? 'bg-[#1B3D34] border-[#1B3D34]'
                          : 'bg-white border-[#0F6D6D]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-bold ${isLatest ? 'text-[#1B3D34]' : 'text-[#0F6D6D]'}`}>
                            {entry.dose}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-semibold bg-[#1B3D34]/10 text-[#1B3D34] px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#747B7D] mt-0.5">{formatDate(entry.date)}</p>
                        {entry.note && (
                          <p className="text-xs text-[#3C4346] mt-0.5 italic">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {medHistory.length === 0 && (
          <p className="text-sm text-[#747B7D] text-center py-2">
            No dose history recorded yet. Log your starting dose below.
          </p>
        )}

        {/* Log form */}
        {showForm ? (
          <div className="bg-[#F6F3EE] border border-[#E7E5E1] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1B3D34]">Log a dose</p>
              <button onClick={() => setShowForm(false)} className="text-[#747B7D]">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1 uppercase tracking-wide">Date</label>
                <input type="date" className={inputClass} value={formDate}
                  onChange={e => setFormDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1 uppercase tracking-wide">Dose</label>
                {guide ? (
                  <select className={inputClass} value={formDose} onChange={e => setFormDose(e.target.value)}>
                    {guide.steps.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <input className={inputClass} value={formDose} onChange={e => setFormDose(e.target.value)} placeholder="e.g. 1 mg" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1 uppercase tracking-wide">Note (optional)</label>
              <input className={inputClass} value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="e.g. Starting dose, Escalated by GP" />
            </div>
            <button onClick={logDose} disabled={!formDate || !formDose}
              className="w-full bg-[#1B3D34] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
              Save Entry
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-[#1B3D34]/30 rounded-xl py-3 text-sm font-medium text-[#1B3D34] hover:bg-[#1B3D34]/5"
          >
            <Plus size={15} /> Log dose change
          </button>
        )}

        <p className="text-[10px] text-[#747B7D] text-center leading-relaxed">
          Only change your dose under GP supervision. Stored locally on this device.
        </p>
      </div>
    </div>
  );
}
