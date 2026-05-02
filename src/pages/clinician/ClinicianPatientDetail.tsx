import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { ProgressChart } from '../../components/ProgressChart';
import { StatCard } from '../../components/StatCard';
import { MedicationCard } from '../../components/MedicationCard';
import { SafetyAlert } from '../../components/SafetyAlert';
import { supabase } from '../../lib/supabase';
import type { Patient, CheckIn, Medication, ClinicianNote } from '../../types';
import {
  weightChange, percentBodyWeightChange, latestCheckIn,
  formatDate, daysUntil,
} from '../../utils';
import { Copy, Check, Save } from 'lucide-react';

const ACTION_BUTTONS = [
  { label: 'Continue current plan', colour: 'bg-[#0F6D6D]' },
  { label: 'Consider dose review', colour: 'bg-[#0F6D6D]' },
  { label: 'Manage side effects', colour: 'bg-[#0F6D6D]' },
  { label: 'Book GP review', colour: 'bg-[#1B3D34]' },
  { label: 'Needs clinical contact', colour: 'bg-red-600' },
];

function dbPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string, name: row.name as string,
    dateOfBirth: (row.date_of_birth as string) ?? '', heightCm: (row.height_cm as number) ?? 0,
    startingWeightKg: (row.starting_weight_kg as number) ?? 0,
    currentWeightKg: (row.current_weight_kg as number) ?? 0,
    goalWeightKg: (row.goal_weight_kg as number) ?? 0,
    waistCm: (row.waist_cm as number) ?? 0,
    mobile: (row.mobile as string) ?? '', email: (row.email as string) ?? '',
    clinicName: (row.clinic_name as string) ?? '',
    reviewIntervalWeeks: ((row.review_interval_weeks as number) ?? 4) as 2 | 4 | 6 | 8,
    nextReviewDate: (row.next_review_date as string) ?? '',
    nextPrescriptionReviewDate: (row.next_prescription_review_date as string) ?? '',
    nextMedicationDoseDate: (row.next_medication_dose_date as string) ?? '',
    safetyAnswers: (row.safety_answers as Patient['safetyAnswers']) ?? {
      pregnant: false, diabetes: false, pancreatitis: false, gallbladder: false,
      eatingDisorder: false, severeReflux: false, currentMedications: '', allergies: '',
    },
    createdAt: (row.created_at as string) ?? '',
  };
}

function dbCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string, patientId: row.patient_id as string,
    date: row.date as string, weightKg: row.weight_kg as number,
    waistCm: row.waist_cm as number | undefined,
    appetiteScore: (row.appetite_score as number) ?? 7,
    energyScore: (row.energy_score as number) ?? 7,
    moodScore: (row.mood_score as number) ?? 7,
    sleepScore: (row.sleep_score as number) ?? 7,
    exerciseLevel: (row.exercise_level as CheckIn['exerciseLevel']) ?? 'none',
    alcoholIntake: (row.alcohol_intake as CheckIn['alcoholIntake']) ?? 'none',
    proteinFocus: (row.protein_focus as boolean) ?? false,
    waterFocus: (row.water_focus as boolean) ?? false,
    sideEffects: (row.side_effects as CheckIn['sideEffects']) ?? ['none'],
    notes: (row.notes as string) ?? '', redFlag: (row.red_flag as boolean) ?? false,
  };
}

function dbMed(row: Record<string, unknown>): Medication {
  return {
    id: row.id as string, patientId: row.patient_id as string,
    name: row.name as string, dose: (row.dose as string) ?? '',
    startDate: (row.start_date as string) ?? '', frequency: (row.frequency as string) ?? '',
    medicationDay: (row.medication_day as string) ?? '',
    nextDoseDate: (row.next_dose_date as string) ?? '',
    prescriptionReviewDate: (row.prescription_review_date as string) ?? '',
    gpReviewDate: (row.gp_review_date as string) ?? '',
    toleranceNotes: (row.tolerance_notes as string) ?? '',
    estimatedDaysRemaining: (row.estimated_days_remaining as number) ?? 0,
  };
}

function dbNote(row: Record<string, unknown>): ClinicianNote {
  return {
    id: row.id as string, patientId: row.patient_id as string,
    date: row.date as string, note: row.note as string,
    plan: (row.plan as string) ?? '', followUpWeeks: (row.follow_up_weeks as number) ?? 4,
  };
}

export function ClinicianPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [medication, setMedication] = useState<Medication | undefined>();
  const [notes, setNotes] = useState<ClinicianNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [planText, setPlanText] = useState('');
  const [followUp, setFollowUp] = useState('4');
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('patients').select('*').eq('id', id).single(),
      supabase.from('check_ins').select('*').eq('patient_id', id).order('date'),
      supabase.from('medications').select('*').eq('patient_id', id).limit(1).single(),
      supabase.from('clinician_notes').select('*').eq('patient_id', id).order('date', { ascending: false }),
    ]).then(([{ data: p }, { data: ci }, { data: med }, { data: n }]) => {
      if (p) setPatient(dbPatient(p as Record<string, unknown>));
      setCheckIns(ci ? ci.map(r => dbCheckIn(r as Record<string, unknown>)) : []);
      if (med) setMedication(dbMed(med as Record<string, unknown>));
      setNotes(n ? n.map(r => dbNote(r as Record<string, unknown>)) : []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell role="clinician" showBack title="Loading…">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell role="clinician" showBack title="Patient Not Found">
        <p className="text-[#3C4346] text-sm">Patient record not found.</p>
      </AppShell>
    );
  }

  const latest = latestCheckIn(checkIns, patient.id);
  const change = weightChange(patient.startingWeightKg, patient.currentWeightKg);
  const pct = percentBodyWeightChange(patient.startingWeightKg, patient.currentWeightKg);

  const generatedNote = `Weight management review. Current weight: ${patient.currentWeightKg} kg. Starting weight: ${patient.startingWeightKg} kg. Change: ${change > 0 ? '+' : ''}${change} kg (${parseFloat(pct) > 0 ? '+' : ''}${pct}%). Current medication: ${medication ? `${medication.name} at ${medication.dose}` : 'not recorded'}. Adherence: ${latest ? 'check-ins recorded' : 'no recent check-ins'}. Side effects: ${latest?.sideEffects.filter(e => e !== 'none').join(', ') || 'none reported'}. Appetite: ${latest?.appetiteScore ?? '—'}/10. Lifestyle: ${latest?.exerciseLevel === 'none' ? 'no exercise recorded' : `${latest?.exerciseLevel} exercise`}. Discussed nutrition, physical activity, medication risks/benefits, side effects, red flags and need for regular review. Plan: ${planText || '__'}. Repeat prescription/review arranged. Follow-up in ${followUp} weeks.`;

  const handleCopyNote = async () => {
    await navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = async () => {
    const { data } = await supabase.from('clinician_notes').insert({
      patient_id: id,
      date: new Date().toISOString().split('T')[0],
      note: generatedNote,
      plan: planText,
      follow_up_weeks: parseInt(followUp),
    }).select().single();
    if (data) setNotes(prev => [dbNote(data as Record<string, unknown>), ...prev]);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const sideEffectCounts: Record<string, number> = {};
  checkIns.forEach(c => {
    c.sideEffects.filter(e => e !== 'none').forEach(e => {
      sideEffectCounts[e] = (sideEffectCounts[e] || 0) + 1;
    });
  });

  return (
    <AppShell role="clinician" title={patient.name} showBack>
      <div className="space-y-5">
        {/* Red flag alert */}
        {latest?.redFlag && (
          <SafetyAlert
            type="red-flag"
            message={`${patient.name} reported red flag symptoms. Review urgently.`}
          />
        )}

        {/* Profile header */}
        <div className="bg-gradient-to-br from-[#0F6D6D] to-[#102D26] rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-white/70 text-sm">DOB: {patient.dateOfBirth} · {patient.clinicName}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Next review</p>
              <p className={`text-sm font-bold ${daysUntil(patient.nextReviewDate) < 0 ? 'text-red-300' : 'text-white'}`}>
                {formatDate(patient.nextReviewDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Current Weight" value={patient.currentWeightKg} unit="kg" colour="neutral" />
          <StatCard label="Starting Weight" value={patient.startingWeightKg} unit="kg" colour="neutral" />
          <StatCard label="Weight Change" value={`${change > 0 ? '+' : ''}${change}`} unit="kg"
            colour={change < 0 ? 'green' : change > 0 ? 'orange' : 'neutral'} />
          <StatCard label="% Body Weight" value={`${parseFloat(pct) > 0 ? '+' : ''}${pct}`} unit="%"
            colour={parseFloat(pct) < 0 ? 'green' : 'orange'} />
        </div>

        {/* Weight chart */}
        {checkIns.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B3D34] mb-3">Weight Trend</h3>
            <ProgressChart checkIns={checkIns} goalWeight={patient.goalWeightKg} />
          </div>
        )}

        {/* Medication */}
        {medication && <MedicationCard medication={medication} />}

        {/* Side effects */}
        {Object.keys(sideEffectCounts).length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B3D34] mb-3">Side Effect History</h3>
            {Object.entries(sideEffectCounts).sort(([,a],[,b]) => b - a).map(([effect, count]) => (
              <div key={effect} className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0] last:border-0 text-sm">
                <span className="capitalize text-[#3C4346]">{effect}</span>
                <span className="font-medium text-[#1B3D34]">{count}×</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent check-ins */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34] mb-3">Recent Check-ins</h3>
          {checkIns.length === 0 ? (
            <p className="text-sm text-[#747B7D]">No check-ins recorded.</p>
          ) : (
            <div className="space-y-2">
              {checkIns.slice(-5).reverse().map(ci => (
                <div key={ci.id} className={`rounded-xl p-3 border text-sm ${ci.redFlag ? 'bg-red-50 border-red-200' : 'bg-[#F6F3EE] border-[#E7E5E1]'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#1B3D34]">{ci.date}</span>
                    <span className={`font-bold ${ci.redFlag ? 'text-red-600' : 'text-[#1B3D34]'}`}>{ci.weightKg} kg</span>
                  </div>
                  <div className="text-xs text-[#3C4346] mt-1 flex gap-3">
                    <span>Energy: {ci.energyScore}/10</span>
                    <span>Mood: {ci.moodScore}/10</span>
                    {ci.sideEffects.filter(e => e !== 'none').length > 0 && (
                      <span className="text-[#8A4D3C]">SE: {ci.sideEffects.filter(e => e !== 'none').join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested actions */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B3D34] mb-3">Suggested Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_BUTTONS.map(({ label, colour }) => (
              <button key={label}
                className={`${colour} text-white rounded-xl px-3 py-2.5 text-xs font-semibold text-left`}>
                {label}
              </button>
            ))}
            <Link to="/clinician/templates" state={{ patientId: id }}
              className="bg-[#3C4346] text-white rounded-xl px-3 py-2.5 text-xs font-semibold">
              Generate consult note
            </Link>
          </div>
        </div>

        {/* Consult note generator */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-[#1B3D34]">Generate Consult Note</h3>

          <div className="bg-[#F6F3EE] rounded-xl p-3 border border-[#E7E5E1] text-sm text-[#3C4346] leading-relaxed">
            {generatedNote}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Plan</label>
            <input
              className="w-full rounded-xl border border-[#E7E5E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6D6D]"
              placeholder="e.g. Continue current dose, recheck pathology, follow up 4 weeks"
              value={planText}
              onChange={e => setPlanText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Follow-up (weeks)</label>
            <select className="w-full rounded-xl border border-[#E7E5E1] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6D6D]"
              value={followUp} onChange={e => setFollowUp(e.target.value)}>
              {['2', '4', '6', '8', '12'].map(w => <option key={w}>{w}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCopyNote}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border ${copied ? 'bg-[#0F6D6D]/10 border-[#0F6D6D]/30 text-[#0F6D6D]' : 'bg-white border-[#E7E5E1] text-[#3C4346]'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Note'}
            </button>
            <button onClick={handleSaveNote}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-[#0F6D6D] text-white">
              <Save size={16} />
              {noteSaved ? 'Saved!' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Past notes */}
        {notes.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B3D34] mb-3">Past Notes</h3>
            {notes.map(note => (
              <div key={note.id} className="border-b border-[#f0f0f0] pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-[#3C4346]">{formatDate(note.date)}</span>
                  <span className="text-xs text-[#747B7D]">F/U: {note.followUpWeeks} weeks</span>
                </div>
                <p className="text-sm text-[#1B3D34] leading-relaxed">{note.note}</p>
                {note.plan && <p className="text-sm text-[#1B3D34] mt-1">Plan: {note.plan}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
