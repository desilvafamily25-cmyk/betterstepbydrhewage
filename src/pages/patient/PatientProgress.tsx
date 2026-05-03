import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { ProgressChart, ScoreTrendChart } from '../../components/ProgressChart';
import { StatCard } from '../../components/StatCard';
import { usePatientData } from '../../hooks/usePatientData';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { weightChange, percentBodyWeightChange } from '../../utils';
import { Plus, X, Star } from 'lucide-react';

const NSV_OPTIONS = [
  'Clothes fitting better', 'More energy', 'Less snoring', 'Better mobility',
  'Improved confidence', 'Improved blood pressure', 'Improved glucose',
  'Less joint pain', 'Better sleep', 'Better concentration',
];

export function PatientProgress() {
  const { patient, checkIns, medications, loading } = usePatientData();
  const [nsvs, setNsvs] = useLocalStorage<string[]>('nsvs', []);
  const [showNsvPicker, setShowNsvPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('Weight');
  const [range, setRange] = useState<30 | 60 | 0>(30);

  if (loading) {
    return (
      <AppShell role="patient" title="Progress">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!patient) return null;

  const medication = medications[0];
  const change = weightChange(patient.startingWeightKg, patient.currentWeightKg);
  const pct = percentBodyWeightChange(patient.startingWeightKg, patient.currentWeightKg);

  const cutoff = range === 0 ? null : (() => {
    const d = new Date();
    d.setDate(d.getDate() - range);
    return d.toISOString().split('T')[0];
  })();
  const filteredCheckIns = cutoff ? checkIns.filter(c => c.date >= cutoff) : checkIns;

  const sideEffectCounts: Record<string, number> = {};
  filteredCheckIns.forEach(c => {
    c.sideEffects.filter(e => e !== 'none').forEach(e => {
      sideEffectCounts[e] = (sideEffectCounts[e] || 0) + 1;
    });
  });

  const tabs = ['Weight', 'Waist', 'Wellbeing'];

  return (
    <AppShell role="patient" title="Progress">
      <div className="space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Starting Weight" value={patient.startingWeightKg} unit="kg" colour="neutral" />
          <StatCard label="Current Weight" value={patient.currentWeightKg} unit="kg" colour="neutral" />
          <StatCard
            label="Total Change"
            value={`${change > 0 ? '+' : ''}${change}`}
            unit="kg"
            colour={change < 0 ? 'green' : change > 0 ? 'red' : 'neutral'}
          />
          <StatCard
            label="% Body Weight"
            value={`${parseFloat(pct) > 0 ? '+' : ''}${pct}`}
            unit="%"
            colour={parseFloat(pct) < 0 ? 'green' : parseFloat(pct) > 0 ? 'red' : 'neutral'}
          />
        </div>

        {/* Medication timeline */}
        {medication && (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B3D34] mb-2">Medication</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#1B3D34]" />
              <div>
                <p className="text-sm font-medium text-[#1B3D34]">{medication.name} — {medication.dose}</p>
                <p className="text-xs text-[#747B7D]">Started {medication.startDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
          <div className="flex justify-end gap-1.5 mb-3">
            {([30, 60, 0] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${range === r ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'text-[#3C4346] border-[#E7E5E1]'}`}>
                {r === 0 ? 'All' : `${r}d`}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-4 border-b border-[#E7E5E1] pb-3">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === t ? 'bg-[#1B3D34] text-white' : 'text-[#3C4346]'}`}>
                {t}
              </button>
            ))}
          </div>

          {checkIns.length === 0 ? (
            <p className="text-sm text-[#747B7D] text-center py-8">
              Complete your first check-in to see your progress charts here.
            </p>
          ) : (
            <>
              {activeTab === 'Weight' && (
                <>
                  <p className="text-sm text-[#3C4346] mb-3">
                    {change < 0
                      ? `You've lost ${Math.abs(change)} kg since starting.`
                      : change > 0
                        ? `You've gained ${change} kg since starting.`
                        : 'Your weight is unchanged since starting.'
                    }
                    {' '}
                    {patient.currentWeightKg > patient.goalWeightKg
                      ? `${(patient.currentWeightKg - patient.goalWeightKg).toFixed(1)} kg to go.`
                      : 'You\'ve reached your goal weight!'
                    }
                  </p>
                  <ProgressChart checkIns={filteredCheckIns} goalWeight={patient.goalWeightKg} dataKey="weightKg" />
                  <p className="text-xs text-[#747B7D] mt-2 text-center">Goal: {patient.goalWeightKg} kg</p>
                </>
              )}

              {activeTab === 'Waist' && (
                <>
                  <h3 className="font-semibold text-[#1B3D34] mb-3">Waist Trend</h3>
                  <ProgressChart checkIns={filteredCheckIns} dataKey="waistCm" label="Waist (cm)" colour="#0F6D6D" />
                </>
              )}

              {activeTab === 'Wellbeing' && (
                <>
                  <h3 className="font-semibold text-[#1B3D34] mb-3">Wellbeing Trends</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'appetiteScore' as const, label: 'Appetite', colour: '#1B3D34' },
                      { key: 'energyScore' as const, label: 'Energy', colour: '#0F6D6D' },
                      { key: 'moodScore' as const, label: 'Mood', colour: '#1B3D34' },
                      { key: 'sleepScore' as const, label: 'Sleep', colour: '#0F6D6D' },
                    ].map(({ key, label, colour }) => (
                      <div key={key}>
                        <p className="text-xs font-semibold text-[#3C4346] mb-1">{label}</p>
                        <ScoreTrendChart checkIns={filteredCheckIns} dataKey={key} label={label} colour={colour} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Side effect summary */}
        {Object.keys(sideEffectCounts).length > 0 && filteredCheckIns.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B3D34] mb-3">Side Effect History</h3>
            <div className="space-y-2">
              {Object.entries(sideEffectCounts).sort(([,a],[,b]) => b - a).map(([effect, count]) => (
                <div key={effect} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-[#1B3D34]">{effect}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-[#1B3D34]/20" style={{ width: `${Math.min(count * 12, 80)}px` }}>
                      <div className="h-full rounded-full bg-[#1B3D34]" style={{ width: `${Math.min(100, count * 20)}%` }} />
                    </div>
                    <span className="text-xs text-[#747B7D]">{count}×</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-scale victories */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#1B3D34]">Non-Scale Victories</h3>
            <button onClick={() => setShowNsvPicker(!showNsvPicker)}
              className="flex items-center gap-1 text-sm text-[#1B3D34] font-medium">
              <Plus size={16} /> Add
            </button>
          </div>

          {nsvs.length === 0 && !showNsvPicker && (
            <p className="text-sm text-[#747B7D] text-center py-4">
              Track wins beyond the scale — energy, confidence, fitness, and more.
            </p>
          )}

          {nsvs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {nsvs.map(nsv => (
                <div key={nsv} className="flex items-center gap-1.5 bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-xl px-3 py-1.5">
                  <Star size={12} className="text-[#B8735E] fill-[#B8735E]" />
                  <span className="text-sm text-[#8A4D3C] font-medium">{nsv}</span>
                  <button onClick={() => setNsvs(prev => prev.filter(n => n !== nsv))} className="text-[#B8735E]/70 hover:text-[#B8735E] ml-0.5">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showNsvPicker && (
            <div className="flex flex-wrap gap-2 mt-2">
              {NSV_OPTIONS.filter(o => !nsvs.includes(o)).map(option => (
                <button key={option}
                  onClick={() => { setNsvs(prev => [...prev, option]); setShowNsvPicker(false); }}
                  className="text-xs bg-[#F6F3EE] border border-[#E7E5E1] rounded-xl px-3 py-2 text-[#3C4346] hover:bg-[#1B3D34]/10 hover:border-[#1B3D34] hover:text-[#1B3D34] font-medium">
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
