import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { SafetyAlert } from '../../components/SafetyAlert';
import { usePatientData } from '../../hooks/usePatientData';
import type { SideEffect, ExerciseLevel, AlcoholIntake } from '../../types';
import { Check } from 'lucide-react';

const sideEffectOptions: SideEffect[] = [
  'none', 'nausea', 'vomiting', 'constipation', 'diarrhoea',
  'reflux', 'abdominal pain', 'dizziness', 'headache',
  'injection site reaction', 'mood changes', 'other',
];

const RED_FLAG_EFFECTS: SideEffect[] = ['vomiting', 'abdominal pain', 'mood changes'];

const exerciseOptions: { value: ExerciseLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'intense', label: 'Intense' },
];

const alcoholOptions: { value: AlcoholIntake; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

function ScoreSlider({ label, value, onChange, help }: { label: string; value: number; onChange: (v: number) => void; help?: string }) {
  const colour = value <= 3 ? '#d64045' : value <= 6 ? '#8A4D3C' : '#1B3D34';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[#1B3D34]">{label}</label>
        <span className="text-sm font-bold" style={{ color: colour }}>{value} / 10</span>
      </div>
      {help && <p className="text-xs text-[#747B7D] mb-2">{help}</p>}
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: colour }}
      />
      <div className="flex justify-between text-[10px] text-[#747B7D] mt-1">
        <span>Low</span><span>Moderate</span><span>High</span>
      </div>
    </div>
  );
}

export function PatientCheckIn() {
  const navigate = useNavigate();
  const { saveCheckIn, patient } = usePatientData();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    weightKg: '',
    waistCm: '',
    appetiteScore: 7,
    energyScore: 7,
    moodScore: 7,
    sleepScore: 7,
    exerciseLevel: 'none' as ExerciseLevel,
    alcoholIntake: 'none' as AlcoholIntake,
    proteinFocus: false,
    waterFocus: false,
    sideEffects: ['none'] as SideEffect[],
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const toggleSideEffect = (effect: SideEffect) => {
    setForm(f => {
      if (effect === 'none') return { ...f, sideEffects: ['none'] };
      const without = f.sideEffects.filter(e => e !== 'none');
      return {
        ...f,
        sideEffects: without.includes(effect)
          ? without.filter(e => e !== effect) || ['none']
          : [...without, effect],
      };
    });
  };

  const hasRedFlag = form.sideEffects.some(e => RED_FLAG_EFFECTS.includes(e));
  const showRedFlag = hasRedFlag && !form.sideEffects.includes('none');

  const handleSubmit = async () => {
    if (!form.weightKg) return;
    await saveCheckIn({
      patientId: patient?.id ?? '',
      date: today,
      weightKg: parseFloat(form.weightKg),
      waistCm: form.waistCm ? parseFloat(form.waistCm) : undefined,
      appetiteScore: form.appetiteScore,
      energyScore: form.energyScore,
      moodScore: form.moodScore,
      sleepScore: form.sleepScore,
      exerciseLevel: form.exerciseLevel,
      alcoholIntake: form.alcoholIntake,
      proteinFocus: form.proteinFocus,
      waterFocus: form.waterFocus,
      sideEffects: form.sideEffects.length ? form.sideEffects : ['none'],
      notes: form.notes,
      redFlag: showRedFlag,
    });
    setSubmitted(true);
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';

  if (submitted) {
    return (
      <AppShell role="patient" title="Daily Check-in">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-[#0F6D6D]/10 flex items-center justify-center mx-auto">
            <Check size={36} className="text-[#0F6D6D]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3D34] mt-4">Check-in saved</h2>
          <p className="text-[#3C4346] mt-2 text-sm">Great work staying on track today.</p>
          {showRedFlag && (
            <div className="mt-4">
              <SafetyAlert
                type="red-flag"
                message="You reported symptoms that may need medical attention. If you are seriously unwell, call 000 or attend your nearest emergency department. For non-urgent concerns, contact your GP."
                showEmergency
              />
            </div>
          )}
          <button onClick={() => navigate('/patient/home')}
            className="mt-6 bg-[#1B3D34] text-white rounded-2xl px-8 py-4 text-base font-semibold w-full">
            Return to Dashboard
          </button>
          <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, weightKg: '' })); }}
            className="mt-2 text-sm text-[#3C4346] underline">
            Log another entry
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="patient" title="Daily Check-in">
      <div className="space-y-6">
        {/* Date */}
        <div className="bg-[#1B3D34]/10 rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-[#1B3D34]">
            Today: {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Weight */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34]">Weight & Measurements</h3>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">
              Today's Weight (kg) *
            </label>
            <input type="number" step="0.1" className={inputClass} value={form.weightKg}
              onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
              placeholder="e.g. 89.5" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">
              Waist Circumference (cm) — optional
            </label>
            <input type="number" step="0.5" className={inputClass} value={form.waistCm}
              onChange={e => setForm(f => ({ ...f, waistCm: e.target.value }))}
              placeholder="e.g. 92" />
          </div>
        </div>

        {/* Wellbeing scores */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 space-y-5 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34]">Wellbeing Scores</h3>
          <ScoreSlider label="Appetite" value={form.appetiteScore} onChange={v => setForm(f => ({ ...f, appetiteScore: v }))}
            help="1 = no appetite, 10 = strong appetite" />
          <ScoreSlider label="Energy" value={form.energyScore} onChange={v => setForm(f => ({ ...f, energyScore: v }))}
            help="1 = exhausted, 10 = very energetic" />
          <ScoreSlider label="Mood" value={form.moodScore} onChange={v => setForm(f => ({ ...f, moodScore: v }))}
            help="1 = very low mood, 10 = excellent mood" />
          <ScoreSlider label="Sleep Quality" value={form.sleepScore} onChange={v => setForm(f => ({ ...f, sleepScore: v }))}
            help="1 = very poor, 10 = excellent" />
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34]">Activity & Lifestyle</h3>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-2 uppercase tracking-wide">Exercise Today</label>
            <div className="grid grid-cols-4 gap-2">
              {exerciseOptions.map(({ value, label }) => (
                <button key={value} onClick={() => setForm(f => ({ ...f, exerciseLevel: value }))}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.exerciseLevel === value ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'bg-white text-[#3C4346] border-[#E7E5E1]'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-2 uppercase tracking-wide">Alcohol Intake</label>
            <div className="grid grid-cols-4 gap-2">
              {alcoholOptions.map(({ value, label }) => (
                <button key={value} onClick={() => setForm(f => ({ ...f, alcoholIntake: value }))}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.alcoholIntake === value ? 'bg-[#0F6D6D] text-white border-[#0F6D6D]' : 'bg-white text-[#3C4346] border-[#E7E5E1]'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${form.proteinFocus ? 'bg-[#0F6D6D]/10 border-[#0F6D6D]/30' : 'bg-white border-[#E7E5E1]'}`}>
              <input type="checkbox" className="w-5 h-5 accent-[#1B3D34]" checked={form.proteinFocus}
                onChange={e => setForm(f => ({ ...f, proteinFocus: e.target.checked }))} />
              <span className="text-sm font-medium text-[#1B3D34]">Protein focus today</span>
            </label>
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${form.waterFocus ? 'bg-[#0F6D6D]/10 border-[#0F6D6D]/30' : 'bg-white border-[#E7E5E1]'}`}>
              <input type="checkbox" className="w-5 h-5 accent-[#0F6D6D]" checked={form.waterFocus}
                onChange={e => setForm(f => ({ ...f, waterFocus: e.target.checked }))} />
              <span className="text-sm font-medium text-[#1B3D34]">Water intake focus</span>
            </label>
          </div>
        </div>

        {/* Side effects */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 space-y-3 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34]">Side Effects Today</h3>
          <div className="flex flex-wrap gap-2">
            {sideEffectOptions.map(effect => {
              const selected = form.sideEffects.includes(effect);
              const isRed = RED_FLAG_EFFECTS.includes(effect);
              return (
                <button key={effect} onClick={() => toggleSideEffect(effect)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    selected
                      ? isRed ? 'bg-red-500 text-white border-red-500'
                      : 'bg-[#1B3D34] text-white border-[#1B3D34]'
                      : 'bg-white text-[#3C4346] border-[#E7E5E1]'
                  }`}>
                  {effect}
                </button>
              );
            })}
          </div>
          {showRedFlag && (
            <SafetyAlert
              type="red-flag"
              message="If you are seriously unwell, call 000 or attend your nearest emergency department. For non-urgent concerns, contact your GP."
              showEmergency
            />
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm">
          <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Notes (optional)</label>
          <textarea className={inputClass + ' resize-none'} rows={3} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Anything else you'd like to note for your GP review..." />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.weightKg}
          className="w-full bg-[#1B3D34] text-white rounded-2xl px-5 py-4 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          Save Today's Check-in
        </button>
      </div>
    </AppShell>
  );
}
