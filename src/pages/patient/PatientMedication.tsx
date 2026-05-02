import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { MedicationCard } from '../../components/MedicationCard';
import { SafetyAlert } from '../../components/SafetyAlert';
import { usePatientData } from '../../hooks/usePatientData';
import type { Medication } from '../../types';
import { Plus, X } from 'lucide-react';

interface MedConfig {
  brand: string;
  generic: string;
  doses: string[];
  frequency: string;
}

const MED_CONFIG: MedConfig[] = [
  {
    brand: 'Ozempic',
    generic: 'semaglutide',
    doses: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
    frequency: 'Weekly injection',
  },
  {
    brand: 'Wegovy',
    generic: 'semaglutide',
    doses: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'],
    frequency: 'Weekly injection',
  },
  {
    brand: 'Mounjaro',
    generic: 'tirzepatide',
    doses: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'],
    frequency: 'Weekly injection',
  },
  {
    brand: 'Saxenda',
    generic: 'liraglutide',
    doses: ['0.6 mg', '1.2 mg', '1.8 mg', '2.4 mg', '3 mg'],
    frequency: 'Daily injection',
  },
  {
    brand: 'Trulicity',
    generic: 'dulaglutide',
    doses: ['0.75 mg', '1.5 mg', '3 mg', '4.5 mg'],
    frequency: 'Weekly injection',
  },
  {
    brand: 'Other',
    generic: '',
    doses: [],
    frequency: '',
  },
];

const BLANK_MED: Omit<Medication, 'id' | 'patientId'> = {
  name: 'Ozempic',
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

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';

  const selectedConfig = MED_CONFIG.find(m => m.brand === form.name) ?? MED_CONFIG[0];
  const isOther = form.name === 'Other';

  const handleBrandChange = (brand: string) => {
    const config = MED_CONFIG.find(m => m.brand === brand);
    if (!config) return;
    setForm(f => ({
      ...f,
      name: brand,
      dose: config.doses[0] ?? '',
      frequency: config.frequency,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveMedication(form);
    setSaving(false);
    setShowForm(false);
    setForm({ ...BLANK_MED });
  };

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

        {medications.length === 0 && !showForm && (
          <div className="text-center py-10 text-[#747B7D]">
            <p className="text-sm">No medications recorded yet.</p>
          </div>
        )}

        {medications.map(med => (
          <MedicationCard key={med.id} medication={med} />
        ))}

        {showForm ? (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-[#1B3D34]">Add Medication</h3>
              <button onClick={() => setShowForm(false)} className="text-[#747B7D]"><X size={18} /></button>
            </div>

            {/* ── Group 1: Medication & Dosing (green tint) ── */}
            <div className="bg-[#f0f9f5] border border-[#c8e6d8] rounded-2xl p-4 space-y-4">
              <p className="text-xs font-bold text-[#1B3D34] uppercase tracking-wide">Medication & Dosing</p>

              {/* Brand picker */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-2 uppercase tracking-wide">Select Medication</label>
                <div className="grid grid-cols-2 gap-2">
                  {MED_CONFIG.map(config => (
                    <button
                      key={config.brand}
                      type="button"
                      onClick={() => handleBrandChange(config.brand)}
                      className={`rounded-xl border px-3 py-3 text-left transition-all ${
                        form.name === config.brand
                          ? 'bg-[#1B3D34] border-[#1B3D34]'
                          : 'bg-white border-[#c8e6d8]'
                      }`}
                    >
                      <p className={`text-sm font-bold leading-tight ${form.name === config.brand ? 'text-white' : 'text-[#1B3D34]'}`}>
                        {config.brand}
                      </p>
                      {config.generic && (
                        <p className={`text-xs mt-0.5 ${form.name === config.brand ? 'text-white/70' : 'text-[#747B7D]'}`}>
                          ({config.generic})
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dose */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Current Dose</label>
                {isOther ? (
                  <input className={inputClass} value={form.dose}
                    onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
                    placeholder="e.g. 1.0 mg" />
                ) : (
                  <select className={inputClass} value={form.dose}
                    onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}>
                    {selectedConfig.doses.map(d => <option key={d}>{d}</option>)}
                  </select>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Frequency</label>
                {isOther ? (
                  <select className={inputClass} value={form.frequency}
                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option>Weekly injection</option>
                    <option>Daily injection</option>
                    <option>Daily tablet</option>
                    <option>Twice daily tablet</option>
                    <option>Three times daily tablet</option>
                  </select>
                ) : (
                  <div className="rounded-xl border border-[#c8e6d8] bg-white px-4 py-3 text-sm text-[#1B3D34] font-medium">
                    {form.frequency}
                  </div>
                )}
              </div>

              {/* Start date + Next dose */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input type="date" className={inputClass} value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Next Dose Date</label>
                  <input type="date" className={inputClass} value={form.nextDoseDate}
                    onChange={e => setForm(f => ({ ...f, nextDoseDate: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* ── Group 2: Schedule (warm beige) ── */}
            <div className="bg-[#fdf6f0] border border-[#e8d5c4] rounded-2xl p-4 space-y-4">
              <p className="text-xs font-bold text-[#8A4D3C] uppercase tracking-wide">Schedule</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Dose Day</label>
                  <select className={inputClass} value={form.medicationDay}
                    onChange={e => setForm(f => ({ ...f, medicationDay: e.target.value }))}>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Daily'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Days Remaining</label>
                  <input type="number" className={inputClass} value={form.estimatedDaysRemaining}
                    onChange={e => setForm(f => ({ ...f, estimatedDaysRemaining: parseInt(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* ── Group 3: GP & Prescription (light grey-blue) ── */}
            <div className="bg-[#f4f6f9] border border-[#dce2ea] rounded-2xl p-4 space-y-4">
              <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide">GP & Prescription</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Repeat Rx Due</label>
                  <input type="date" className={inputClass} value={form.prescriptionReviewDate}
                    onChange={e => setForm(f => ({ ...f, prescriptionReviewDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">GP Review Due</label>
                  <input type="date" className={inputClass} value={form.gpReviewDate}
                    onChange={e => setForm(f => ({ ...f, gpReviewDate: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Tolerance Notes</label>
                <textarea className={inputClass + ' resize-none'} rows={2} value={form.toleranceNotes}
                  onChange={e => setForm(f => ({ ...f, toleranceNotes: e.target.value }))}
                  placeholder="How are you tolerating this medication?" />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.dose}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-3.5 font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Medication'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#1B3D34]/30 rounded-2xl py-4 text-[#1B3D34] font-medium text-sm hover:bg-[#1B3D34]/5"
          >
            <Plus size={18} /> Add Medication
          </button>
        )}
      </div>
    </AppShell>
  );
}
