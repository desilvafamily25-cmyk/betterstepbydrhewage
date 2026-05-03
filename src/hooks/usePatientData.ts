import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Patient, CheckIn, Medication, Reminder } from '../types';

function dbPatientToLocal(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string,
    dateOfBirth: (row.date_of_birth as string) ?? '',
    heightCm: (row.height_cm as number) ?? 0,
    startingWeightKg: (row.starting_weight_kg as number) ?? 0,
    currentWeightKg: (row.current_weight_kg as number) ?? 0,
    goalWeightKg: (row.goal_weight_kg as number) ?? 0,
    waistCm: (row.waist_cm as number) ?? 0,
    mobile: (row.mobile as string) ?? '',
    email: (row.email as string) ?? '',
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

function dbCheckInToLocal(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    date: row.date as string,
    weightKg: row.weight_kg as number,
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
    notes: (row.notes as string) ?? '',
    redFlag: (row.red_flag as boolean) ?? false,
  };
}

function dbMedToLocal(row: Record<string, unknown>): Medication {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    name: row.name as string,
    dose: (row.dose as string) ?? '',
    startDate: (row.start_date as string) ?? '',
    frequency: (row.frequency as string) ?? '',
    medicationDay: (row.medication_day as string) ?? '',
    nextDoseDate: (row.next_dose_date as string) ?? '',
    prescriptionReviewDate: (row.prescription_review_date as string) ?? '',
    gpReviewDate: (row.gp_review_date as string) ?? '',
    toleranceNotes: (row.tolerance_notes as string) ?? '',
    estimatedDaysRemaining: (row.estimated_days_remaining as number) ?? 0,
  };
}

export function usePatientData() {
  const { user, patientId } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!user || !patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [{ data: p }, { data: ci }, { data: meds }, { data: rem }] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('check_ins').select('*').eq('patient_id', patientId).order('date'),
      supabase.from('medications').select('*').eq('patient_id', patientId),
      supabase.from('reminders').select('*').eq('patient_id', patientId),
    ]);

    if (p) setPatient(dbPatientToLocal(p as Record<string, unknown>));
    setCheckIns((ci ?? []).map(r => dbCheckInToLocal(r as Record<string, unknown>)));
    setMedications((meds ?? []).map(r => dbMedToLocal(r as Record<string, unknown>)));
    setReminders(rem ?? []);
    setLoading(false);
  }, [user, patientId]);

  useEffect(() => { load(); }, [load]);

  const saveCheckIn = async (ci: Omit<CheckIn, 'id'>) => {
    if (!patientId) return;
    const { data } = await supabase.from('check_ins').insert({
      patient_id: patientId,
      date: ci.date,
      weight_kg: ci.weightKg,
      waist_cm: ci.waistCm ?? null,
      appetite_score: ci.appetiteScore,
      energy_score: ci.energyScore,
      mood_score: ci.moodScore,
      sleep_score: ci.sleepScore,
      exercise_level: ci.exerciseLevel,
      alcohol_intake: ci.alcoholIntake,
      protein_focus: ci.proteinFocus,
      water_focus: ci.waterFocus,
      side_effects: ci.sideEffects,
      notes: ci.notes,
      red_flag: ci.redFlag,
    }).select().single();
    if (data) {
      setCheckIns(prev => [...prev, dbCheckInToLocal(data as Record<string, unknown>)]);
      // Update patient's current weight
      await supabase.from('patients').update({ current_weight_kg: ci.weightKg }).eq('id', patientId);
    }
  };

  const updateReminderStatus = async (id: string, status: Reminder['status']) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('reminders').update({ status }).eq('id', id);
  };

  const medPayload = (med: Omit<Medication, 'id' | 'patientId'>) => ({
    name: med.name,
    dose: med.dose,
    start_date: med.startDate || null,
    frequency: med.frequency,
    medication_day: med.medicationDay,
    next_dose_date: med.nextDoseDate || null,
    prescription_review_date: med.prescriptionReviewDate || null,
    gp_review_date: med.gpReviewDate || null,
    tolerance_notes: med.toleranceNotes,
    estimated_days_remaining: med.estimatedDaysRemaining,
  });

  const saveMedication = async (med: Omit<Medication, 'id' | 'patientId'>) => {
    if (!patientId) return;
    const { data } = await supabase.from('medications').insert({
      patient_id: patientId,
      ...medPayload(med),
    }).select().single();
    if (data) setMedications(prev => [...prev, dbMedToLocal(data as Record<string, unknown>)]);
  };

  const updateMedication = async (id: string, med: Omit<Medication, 'id' | 'patientId'>) => {
    const { data } = await supabase.from('medications').update(medPayload(med)).eq('id', id).select().single();
    if (data) setMedications(prev => prev.map(m => m.id === id ? dbMedToLocal(data as Record<string, unknown>) : m));
  };

  const deleteMedication = async (id: string) => {
    await supabase.from('medications').delete().eq('id', id);
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  return { patient, checkIns, medications, reminders, loading, saveCheckIn, saveMedication, updateMedication, deleteMedication, updateReminderStatus, reload: load };
}

// For clinician view — loads all patients, check-ins, and medications
export function useClinicianData() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'clinician') {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from('patients').select('*'),
      supabase.from('check_ins').select('*').order('date'),
      supabase.from('medications').select('*'),
    ]).then(([{ data: p }, { data: ci }, { data: meds }]) => {
      setPatients(p ? p.map(r => dbPatientToLocal(r as Record<string, unknown>)) : []);
      setCheckIns(ci ? ci.map(r => dbCheckInToLocal(r as Record<string, unknown>)) : []);
      setMedications(meds ? meds.map(r => dbMedToLocal(r as Record<string, unknown>)) : []);
      setLoading(false);
    });
  }, [role]);

  return { patients, checkIns, medications, loading };
}
