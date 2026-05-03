import { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { MedicationCard } from '../../components/MedicationCard';
import { SafetyAlert } from '../../components/SafetyAlert';
import { InjectionSiteTracker } from '../../components/InjectionSiteTracker';
import { DoseTimeline } from '../../components/DoseTimeline';
import { usePatientData } from '../../hooks/usePatientData';
import type { Medication } from '../../types';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

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
  dose: '0.25 mg',
  startDate: '',
  frequency: 'Weekly injection',
  medicationDay: 'Wednesday',
  nextDoseDate: '',
  prescriptionReviewDate: '',
  gpReviewDate: '',
  toleranceNotes: '',
  estimatedDaysRemaining: 28,
};

const pad = (n: number) => String(n).padStart(2, '0');

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function PatientMedication() {
  const { medications, loading, saveMedication, updateMedication, deleteMedication } = usePatientData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...BLANK_MED });
  const [justSelected, setJustSelected] = useState(false);
  const [errors, setErrors] = useState<{ dose?: string; startDate?: string }>({});

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';

  const selectedConfig = MED_CONFIG.find(m => m.brand === form.name) ?? MED_CONFIG[0];
  const isOther = form.name === 'Other';

  useEffect(() => {
    if (!justSelected) return;
    const t = setTimeout(() => setJustSelected(false), 2500);
    return () => clearTimeout(t);
  }, [justSelected]);

  const openAddForm = () => {
    setForm({ ...BLANK_MED });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (med: Medication) => {
    setForm({
      name: med.name,
      dose: med.dose,
      startDate: med.startDate,
      frequency: med.frequency,
      medicationDay: med.medicationDay,
      nextDoseDate: med.nextDoseDate,
      prescriptionReviewDate: med.prescriptionReviewDate,
      gpReviewDate: med.gpReviewDate,
      toleranceNotes: med.toleranceNotes,
      estimatedDaysRemaining: med.estimatedDaysRemaining,
    });
    setEditingId(med.id);
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...BLANK_MED });
    setErrors({});
  };

  const handleBrandChange = (brand: string) => {
    const config = MED_CONFIG.find(m => m.brand === brand);
    if (!config) return;
    setForm(f => ({
      ...f,
      name: brand,
      dose: config.doses[0] ?? '',
      frequency: config.frequency,
    }));
    setJustSelected(true);
    setErrors({});
  };

  const handleStartDateChange = (dateStr: string) => {
    setErrors(e => ({ ...e, startDate: undefined }));
    if (!dateStr) { setForm(f => ({ ...f, startDate: '' })); return; }

    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[d.getDay()];

    const isDaily = form.frequency === 'Daily injection';
    const nextDoseDate = addDays(dateStr, isDaily ? 1 : 7);
    const prescriptionReviewDate = addDays(dateStr, 28);

    setForm(f => ({
      ...f,
      startDate: dateStr,
      nextDoseDate,
      medicationDay: isDaily ? 'Daily' : dayName,
      prescriptionReviewDate,
    }));
  };

  const handleSave = async () => {
    const newErrors: { dose?: string; startDate?: string } = {};
    if (!form.dose) newErrors.dose = 'Please select a dose';
    if (!form.startDate) newErrors.startDate = 'Please enter a start date';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    if (editingId) {
      await updateMedication(editingId, form);
    } else {
      await saveMedication(form);
    }
    setSaving(false);
    closeForm();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medication record? This cannot be undone.')) return;
    await deleteMedication(id);
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
          <div key={med.id} className="space-y-3">
            <MedicationCard medication={med} />
            {!showForm && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => openEditForm(med)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E5E1] bg-white text-xs font-medium text-[#3C4346] hover:border-[#1B3D34] hover:text-[#1B3D34]"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-white text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
            {!showForm && <DoseTimeline medication={med} />}
            {!showForm && <InjectionSiteTracker />}
          </div>
        ))}

        {showForm ? (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-[#1B3D34]">{editingId ? 'Edit Medication' : 'Add Medication'}</h3>
              <button onClick={closeForm} className="text-[#747B7D]"><X size={18} /></button>
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
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide transition-colors duration-300 ${
                  justSelected ? 'text-[#1a7a5e]' : errors.dose ? 'text-red-500' : 'text-[#3C4346]'
                }`}>
                  Current Dose *
                  {justSelected && <span className="ml-2 normal-case font-normal text-[#1a7a5e]">← select your dose</span>}
                </label>
                <div className={`rounded-xl transition-all duration-300 ${
                  justSelected
                    ? 'ring-2 ring-[#1a7a5e] ring-offset-1 shadow-[0_0_0_4px_rgba(26,122,94,0.12)]'
                    : errors.dose
                    ? 'ring-2 ring-red-400'
                    : ''
                }`}>
                  {isOther ? (
                    <input className={inputClass} value={form.dose}
                      onChange={e => { setForm(f => ({ ...f, dose: e.target.value })); setErrors(e2 => ({ ...e2, dose: undefined })); }}
                      placeholder="e.g. 1.0 mg" />
                  ) : (
                    <select className={inputClass} value={form.dose}
                      onChange={e => { setForm(f => ({ ...f, dose: e.target.value })); setErrors(e2 => ({ ...e2, dose: undefined })); }}>
                      {selectedConfig.doses.map(d => <option key={d}>{d}</option>)}
                    </select>
                  )}
                </div>
                {errors.dose && <p className="text-xs text-red-500 mt-1">{errors.dose}</p>}
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
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide transition-colors duration-300 ${
                    justSelected ? 'text-[#1a7a5e]' : errors.startDate ? 'text-red-500' : 'text-[#3C4346]'
                  }`}>
                    First Dose Date *
                  </label>
                  <div className={`rounded-xl transition-all duration-300 ${
                    justSelected
                      ? 'ring-2 ring-[#1a7a5e] ring-offset-1 shadow-[0_0_0_4px_rgba(26,122,94,0.12)]'
                      : errors.startDate
                      ? 'ring-2 ring-red-400'
                      : ''
                  }`}>
                    <input type="date" className={inputClass} value={form.startDate}
                      onChange={e => handleStartDateChange(e.target.value)} />
                  </div>
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
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
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Medication'}
            </button>
          </div>
        ) : (
          <button
            onClick={openAddForm}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#1B3D34]/30 rounded-2xl py-4 text-[#1B3D34] font-medium text-sm hover:bg-[#1B3D34]/5"
          >
            <Plus size={18} /> Add Medication
          </button>
        )}
      </div>
    </AppShell>
  );
}
