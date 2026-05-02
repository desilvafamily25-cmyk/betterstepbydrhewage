import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafetyAlert } from '../../components/SafetyAlert';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { APP_CONFIG } from '../../config';
import { ChevronRight, ChevronLeft, Loader } from 'lucide-react';

const steps = ['Personal Details', 'Clinical Details', 'Safety Screening', 'Complete'];

const inputClass = 'w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:outline-none focus:ring-2 focus:ring-[#1a7a5e] focus:border-transparent';
const labelClass = 'block text-xs font-semibold text-[#5a6477] mb-1.5 uppercase tracking-wide';
const checkClass = 'w-5 h-5 rounded accent-[#1a7a5e] flex-shrink-0';

export function PatientOnboarding() {
  const navigate = useNavigate();
  const { user, reloadProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [form, setForm] = useState({
    // Personal
    name: '',
    dob: '',
    heightCm: '',
    waistCm: '',
    mobile: '',
    email: user?.email ?? '',
    // Clinical
    startingWeightKg: '',
    currentWeightKg: '',
    goalWeightKg: '',
    clinicName: APP_CONFIG.clinicName,
    reviewIntervalWeeks: '4',
    medicationReminderDay: 'Wednesday',
    // Safety
    pregnant: false,
    diabetes: false,
    pancreatitis: false,
    gallbladder: false,
    eatingDisorder: false,
    severeReflux: false,
    currentMedications: '',
    allergies: '',
  });

  const update = (key: string, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  const hasSafetyIssue = form.pregnant || form.diabetes || form.pancreatitis ||
    form.gallbladder || form.eatingDisorder || form.severeReflux;

  // Calculate next review date from today + interval
  const nextReviewDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(form.reviewIntervalWeeks) * 7);
    return d.toISOString().split('T')[0];
  };

  // Calculate next prescription review (interval - 7 days warning)
  const nextPrescriptionDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(form.reviewIntervalWeeks) * 7 - 7);
    return d.toISOString().split('T')[0];
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError('');

    const startWeight = parseFloat(form.startingWeightKg);
    const currentWeight = parseFloat(form.currentWeightKg) || startWeight;

    const { error } = await supabase.from('patients').insert({
      user_id: user.id,
      name: form.name.trim(),
      date_of_birth: form.dob || null,
      height_cm: form.heightCm ? parseFloat(form.heightCm) : null,
      starting_weight_kg: startWeight,
      current_weight_kg: currentWeight,
      goal_weight_kg: form.goalWeightKg ? parseFloat(form.goalWeightKg) : null,
      waist_cm: form.waistCm ? parseFloat(form.waistCm) : null,
      mobile: form.mobile || null,
      email: form.email || user.email,
      clinic_name: form.clinicName || null,
      review_interval_weeks: parseInt(form.reviewIntervalWeeks),
      next_review_date: nextReviewDate(),
      next_prescription_review_date: nextPrescriptionDate(),
      next_medication_dose_date: null,
      safety_answers: {
        pregnant: form.pregnant,
        diabetes: form.diabetes,
        pancreatitis: form.pancreatitis,
        gallbladder: form.gallbladder,
        eatingDisorder: form.eatingDisorder,
        severeReflux: form.severeReflux,
        currentMedications: form.currentMedications,
        allergies: form.allergies,
      },
    });

    if (error) {
      setSaveError('Could not save your profile. Please try again.');
      setSaving(false);
      return;
    }

    // Reload auth context so patientId is updated → App routes to /patient/home
    await reloadProfile();
    setSaving(false);
    navigate('/patient/home');
  };

  const safetyQuestion = (key: keyof typeof form, label: string) => (
    <label key={key} className="flex items-start gap-3 p-3 rounded-xl border border-[#e8eaed] bg-white cursor-pointer">
      <input type="checkbox" className={checkClass} checked={form[key] as boolean}
        onChange={e => update(key, e.target.checked)} />
      <span className="text-sm text-[#1a1f2e] leading-snug">{label}</span>
    </label>
  );

  const canProceedStep0 = form.name.trim().length > 1;
  const canProceedStep1 = !!form.startingWeightKg && !!form.goalWeightKg;

  return (
    <div className="min-h-dvh bg-[#f7f8fa] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a7a5e] px-5 pt-12 pb-8 text-white">
        <p className="text-white/70 text-sm">Step {step + 1} of {steps.length}</p>
        <h1 className="text-2xl font-bold mt-1">Set up your profile</h1>
        <p className="text-white/80 text-sm mt-1">{steps[step]}</p>
        <div className="mt-4 bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4 max-w-lg mx-auto w-full">

        {/* ── Step 0: Personal ── */}
        {step === 0 && (
          <>
            <div>
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} value={form.name}
                onChange={e => update('name', e.target.value)} placeholder="Your full name" autoComplete="name" />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" className={inputClass} value={form.dob}
                onChange={e => update('dob', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" className={inputClass} value={form.heightCm}
                  onChange={e => update('heightCm', e.target.value)} placeholder="165" />
              </div>
              <div>
                <label className={labelClass}>Waist (cm)</label>
                <input type="number" className={inputClass} value={form.waistCm}
                  onChange={e => update('waistCm', e.target.value)} placeholder="90" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input type="tel" className={inputClass} value={form.mobile}
                onChange={e => update('mobile', e.target.value)} placeholder="04XX XXX XXX" autoComplete="tel" />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" className={inputClass} value={form.email}
                onChange={e => update('email', e.target.value)} placeholder="you@email.com.au" autoComplete="email" />
            </div>
          </>
        )}

        {/* ── Step 1: Clinical ── */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Starting Weight (kg) *</label>
                <input type="number" step="0.1" className={inputClass} value={form.startingWeightKg}
                  onChange={e => update('startingWeightKg', e.target.value)} placeholder="95.0" />
              </div>
              <div>
                <label className={labelClass}>Goal Weight (kg) *</label>
                <input type="number" step="0.1" className={inputClass} value={form.goalWeightKg}
                  onChange={e => update('goalWeightKg', e.target.value)} placeholder="80.0" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                Your <strong>current weight</strong> — enter this if different from your starting weight (e.g. you've already lost some weight before joining).
              </p>
            </div>
            <div>
              <label className={labelClass}>Current Weight (kg) — leave blank if same as starting</label>
              <input type="number" step="0.1" className={inputClass} value={form.currentWeightKg}
                onChange={e => update('currentWeightKg', e.target.value)} placeholder={form.startingWeightKg || '95.0'} />
            </div>
            <div>
              <label className={labelClass}>GP / Clinic Name</label>
              <input className={inputClass} value={form.clinicName}
                onChange={e => update('clinicName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Preferred Review Interval</label>
              <select className={inputClass} value={form.reviewIntervalWeeks}
                onChange={e => update('reviewIntervalWeeks', e.target.value)}>
                <option value="2">Every 2 weeks</option>
                <option value="4">Every 4 weeks</option>
                <option value="6">Every 6 weeks</option>
                <option value="8">Every 8 weeks</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferred Medication Reminder Day</label>
              <select className={inputClass} value={form.medicationReminderDay}
                onChange={e => update('medicationReminderDay', e.target.value)}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d =>
                  <option key={d}>{d}</option>
                )}
              </select>
            </div>
          </>
        )}

        {/* ── Step 2: Safety ── */}
        {step === 2 && (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-sm text-blue-800 font-medium">
                Please answer honestly. This helps {APP_CONFIG.doctorName} provide safe and personalised care.
              </p>
            </div>
            <div className="space-y-2">
              {safetyQuestion('pregnant', 'Are you pregnant, breastfeeding, or trying to conceive?')}
              {safetyQuestion('diabetes', 'Do you have diabetes?')}
              {safetyQuestion('pancreatitis', 'Have you ever had pancreatitis?')}
              {safetyQuestion('gallbladder', 'Do you have gallbladder disease?')}
              {safetyQuestion('eatingDisorder', 'Do you have a history of an eating disorder?')}
              {safetyQuestion('severeReflux', 'Do you have severe reflux, vomiting, or abdominal pain?')}
            </div>
            <div>
              <label className={labelClass}>Current Medications</label>
              <textarea className={inputClass + ' resize-none'} rows={3} value={form.currentMedications}
                onChange={e => update('currentMedications', e.target.value)}
                placeholder="List any medications you are currently taking" />
            </div>
            <div>
              <label className={labelClass}>Known Allergies</label>
              <input className={inputClass} value={form.allergies}
                onChange={e => update('allergies', e.target.value)} placeholder="e.g. Penicillin, Nil known" />
            </div>
            {hasSafetyIssue && (
              <SafetyAlert
                type="warning"
                message="Please discuss this with your GP before continuing or changing weight management medication."
              />
            )}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}
          </>
        )}

        {/* ── Step 3: Complete ── */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-[#1a1f2e] mt-4">Profile Complete!</h2>
            <p className="text-[#5a6477] mt-2 text-sm leading-relaxed">
              Welcome to Betterstep, {form.name.split(' ')[0] || 'there'}.
              Your dashboard is ready — start your first check-in to begin tracking your progress.
            </p>
            <div className="mt-5 bg-[#f0f9f5] border border-green-100 rounded-2xl p-4 text-left space-y-1.5">
              <p className="text-xs font-semibold text-[#1a7a5e] uppercase tracking-wide">Your summary</p>
              <p className="text-sm text-[#1a1f2e]"><span className="text-[#5a6477]">Name:</span> {form.name}</p>
              <p className="text-sm text-[#1a1f2e]"><span className="text-[#5a6477]">Starting weight:</span> {form.startingWeightKg} kg</p>
              <p className="text-sm text-[#1a1f2e]"><span className="text-[#5a6477]">Goal weight:</span> {form.goalWeightKg} kg</p>
              <p className="text-sm text-[#1a1f2e]"><span className="text-[#5a6477]">Review interval:</span> Every {form.reviewIntervalWeeks} weeks</p>
            </div>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="mt-6 bg-[#1a7a5e] text-white rounded-2xl px-8 py-4 text-base font-semibold w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving
                ? <><Loader size={18} className="animate-spin" /> Saving your profile…</>
                : 'Go to My Dashboard'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="px-5 pb-8 flex gap-3 max-w-lg mx-auto w-full">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 border border-[#e8eaed] bg-white text-[#5a6477] rounded-2xl px-5 py-4 font-semibold">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && !canProceedStep0 || step === 1 && !canProceedStep1}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a7a5e] text-white rounded-2xl px-5 py-4 font-semibold text-base disabled:opacity-40"
          >
            {step === 2 ? 'Review & Complete' : 'Continue'} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
