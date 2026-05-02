import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { MedicationCard } from '../../components/MedicationCard';
import { SafetyAlert } from '../../components/SafetyAlert';
import { usePatientData } from '../../hooks/usePatientData';
import type { Medication, MedicationName } from '../../types';
import { Plus, X } from 'lucide-react';

const MED_NAMES: MedicationName[] = ['Semaglutide', 'Tirzepatide', 'Liraglutide', 'Phentermine', 'Orlistat', 'Metformin', 'Other'];

const BLANK_MED: Omit<Medication, 'id' | 'patientId'> = {
  name: 'Semaglutide',
  dose: '',
  startDate: new Date().toISOString().split('T')[0],
  frequency: 'Weekly injection',
  medicationDay: 'Wednesday',
  nextDoseDate: '',
  prescriptionReviewDate: '',
  gpReviewDate: '',
  toleranceNotes: '',
  estimatedDaysRemaining: 28,
};

export function PatientMedication() {
  const { medications, loading, saveMedication } = usePatientData();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...BLANK_MED });

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveMedication(form);
    setSaving(false);
    setShowForm(false);
    setForm({ ...BLANK_MED });
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';

  if (loading) {
    return (
      <AppShell role="patient" title="Medication">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="patient" title="Medication">
      <div className="space-y-5">
        <SafetyAlert
          type="warning"
          message="Medication changes must be discussed with your GP. Do not increase, stop, or restart medication without medical advice."
        />

        {medications.length === 0 && (
          <div className="text-center py-10 text-[#747B7D]">
            <p className="text-sm">No medications recorded yet.</p>
          </div>
        )}

        {medications.map(med => (
          <MedicationCard key={med.id} medication={med} />
        ))}

        {showForm ? (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1B3D34]">Add Medication</h3>
              <button onClick={() => setShowForm(false)} className="text-[#747B7D]"><X size={18} /></button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Medication Name</label>
              <select className={inputClass} value={form.name as string}
                onChange={e => update('name', e.target.value)}>
                {MED_NAMES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Current Dose</label>
                <input className={inputClass} value={form.dose} onChange={e => update('dose', e.target.value)} placeholder="e.g. 1.0 mg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Frequency</label>
                <select className={inputClass} value={form.frequency} onChange={e => update('frequency', e.target.value)}>
                  <option>Weekly injection</option>
                  <option>Daily injection</option>
                  <option>Daily tablet</option>
                  <option>Twice daily tablet</option>
                  <option>Three times daily tablet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Start Date</label>
                <input type="date" className={inputClass} value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Injection/Dose Day</label>
                <select className={inputClass} value={form.medicationDay} onChange={e => update('medicationDay', e.target.value)}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Daily'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Next Dose Date</label>
                <input type="date" className={inputClass} value={form.nextDoseDate} onChange={e => update('nextDoseDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Estimated Days Remaining</label>
                <input type="number" className={inputClass} value={form.estimatedDaysRemaining} onChange={e => update('estimatedDaysRemaining', parseInt(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Repeat Prescription Due</label>
                <input type="date" className={inputClass} value={form.prescriptionReviewDate} onChange={e => update('prescriptionReviewDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">GP Review Due</label>
                <input type="date" className={inputClass} value={form.gpReviewDate} onChange={e => update('gpReviewDate', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Tolerance Notes</label>
              <textarea className={inputClass + ' resize-none'} rows={2} value={form.toleranceNotes}
                onChange={e => update('toleranceNotes', e.target.value)} placeholder="How are you tolerating this medication?" />
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-3.5 font-semibold disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Medication'}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#1B3D34]/30 rounded-2xl py-4 text-[#1B3D34] font-medium text-sm hover:bg-[#1B3D34]/5">
            <Plus size={18} /> Add Medication
          </button>
        )}
      </div>
    </AppShell>
  );
}
