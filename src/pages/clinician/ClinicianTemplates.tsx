import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useClinicianData } from '../../hooks/usePatientData';
import { weightChange, percentBodyWeightChange, latestCheckIn } from '../../utils';
import { Copy, Check, Printer } from 'lucide-react';

export function ClinicianTemplates() {
  const { patients, checkIns, medications, loading } = useClinicianData();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [plan, setPlan] = useState('');
  const [followUp, setFollowUp] = useState('4');
  const [adherence, setAdherence] = useState('Good');
  const [copied, setCopied] = useState(false);

  const effectivePatientId = selectedPatientId || patients[0]?.id || '';
  const patient = patients.find(p => p.id === effectivePatientId);
  const medication = medications.find(m => m.patientId === effectivePatientId);
  const latest = latestCheckIn(checkIns, effectivePatientId);

  const change = patient ? weightChange(patient.startingWeightKg, patient.currentWeightKg) : 0;
  const pct = patient ? percentBodyWeightChange(patient.startingWeightKg, patient.currentWeightKg) : '0';

  const sideEffects = latest?.sideEffects.filter(e => e !== 'none').join(', ') || 'none reported';
  const appetite = latest ? `${latest.appetiteScore}/10` : 'not recorded';
  const exercise = latest ? latest.exerciseLevel : 'not recorded';

  const note = patient ? `Weight management review. Current weight: ${patient.currentWeightKg} kg. Starting weight: ${patient.startingWeightKg} kg. Change: ${change > 0 ? '+' : ''}${change} kg (${parseFloat(pct) > 0 ? '+' : ''}${pct}%). Current medication: ${medication ? `${medication.name} at ${medication.dose}` : 'not recorded'}. Adherence: ${adherence}. Side effects: ${sideEffects}. Appetite: ${appetite}. Lifestyle: ${exercise}. Discussed nutrition, physical activity, medication risks/benefits, side effects, red flags and need for regular review. Plan: ${plan || '___'}. Repeat prescription/review arranged. Follow-up in ${followUp} weeks.` : '';

  const handleCopy = async () => {
    if (!note) return;
    await navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#0F6D6D]';

  if (loading) {
    return (
      <AppShell role="clinician" title="Consult Note Generator">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="clinician" title="Consult Note Generator">
      <div className="space-y-5">
        <div className="bg-[#0F6D6D]/10 rounded-2xl p-4">
          <p className="text-sm text-[#0F6D6D] font-medium">Generate an Australian-style GP consult note — ready to copy into your clinical record.</p>
        </div>

        {/* Patient selector */}
        <div>
          <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Patient</label>
          {patients.length === 0 ? (
            <p className="text-sm text-[#747B7D]">No patients enrolled yet.</p>
          ) : (
            <select className={inputClass}
              value={effectivePatientId}
              onChange={e => setSelectedPatientId(e.target.value)}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>

        {/* Customisation */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#1B3D34]">Customise Note</h3>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Adherence</label>
            <select className={inputClass} value={adherence} onChange={e => setAdherence(e.target.value)}>
              <option>Good</option>
              <option>Variable</option>
              <option>Poor</option>
              <option>Awaiting first dose</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Plan</label>
            <input className={inputClass}
              placeholder="e.g. Continue current dose, review in 4 weeks, repeat pathology"
              value={plan}
              onChange={e => setPlan(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Follow-up Interval</label>
            <select className={inputClass} value={followUp} onChange={e => setFollowUp(e.target.value)}>
              {['2', '4', '6', '8', '12'].map(w => <option key={w}>{w} weeks</option>)}
            </select>
          </div>
        </div>

        {/* Generated note */}
        <div className="bg-white rounded-2xl border-2 border-[#0F6D6D]/20 p-5 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34] mb-3 flex items-center gap-2">
            <span>Generated Note</span>
            <span className="text-xs bg-[#0F6D6D]/10 text-[#0F6D6D] px-2 py-0.5 rounded-full font-medium">AU Clinical Style</span>
          </h3>
          <p className="text-sm text-[#1B3D34] leading-relaxed font-mono bg-[#F6F3EE] rounded-xl p-4 border border-[#E7E5E1]">
            {note || 'Select a patient to generate a note.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleCopy} disabled={!note}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold border disabled:opacity-40 ${copied ? 'bg-[#0F6D6D]/10 border-[#0F6D6D]/30 text-[#0F6D6D]' : 'bg-white border-[#E7E5E1] text-[#3C4346]'}`}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Note'}
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#0F6D6D] text-white rounded-2xl px-5 py-3.5 text-sm font-semibold">
            <Printer size={18} />
            Print
          </button>
        </div>

        {/* Template reference */}
        <div className="bg-[#F6F3EE] rounded-2xl border border-[#E7E5E1] p-4">
          <h4 className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-2">Note Template Structure</h4>
          <p className="text-xs text-[#747B7D] leading-relaxed font-mono">
            Weight management review. Current weight: __ kg. Starting weight: __ kg. Change: __ kg (__%). Current medication: __ at __ dose. Adherence: __. Side effects: __. Appetite: __. Lifestyle: __. Discussed nutrition, physical activity, medication risks/benefits, side effects, red flags and need for regular review. Plan: __. Repeat prescription/review arranged. Follow-up in __ weeks.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
