export type SideEffect =
  | 'none' | 'nausea' | 'vomiting' | 'constipation' | 'diarrhoea'
  | 'reflux' | 'abdominal pain' | 'dizziness' | 'headache'
  | 'injection site reaction' | 'mood changes' | 'other';

export type ExerciseLevel = 'none' | 'light' | 'moderate' | 'intense';
export type AlcoholIntake = 'none' | 'low' | 'moderate' | 'high';
export type MedicationName = 'Ozempic' | 'Wegovy' | 'Mounjaro' | 'Saxenda' | 'Trulicity' | 'Other';
export type ReminderType = 'weight-check' | 'medication-dose' | 'gp-review' | 'prescription-review' | 'pathology' | 'lifestyle';
export type ReminderStatus = 'pending' | 'acknowledged' | 'dismissed';

export interface SafetyAnswers {
  pregnant: boolean;
  diabetes: boolean;
  pancreatitis: boolean;
  gallbladder: boolean;
  eatingDisorder: boolean;
  severeReflux: boolean;
  currentMedications: string;
  allergies: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  heightCm: number;
  startingWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  waistCm: number;
  mobile: string;
  email: string;
  clinicName: string;
  reviewIntervalWeeks: 2 | 4 | 6 | 8;
  nextReviewDate: string;
  nextPrescriptionReviewDate: string;
  nextMedicationDoseDate: string;
  safetyAnswers: SafetyAnswers;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  patientId: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  appetiteScore: number;
  energyScore: number;
  moodScore: number;
  sleepScore: number;
  exerciseLevel: ExerciseLevel;
  alcoholIntake: AlcoholIntake;
  proteinFocus: boolean;
  waterFocus: boolean;
  sideEffects: SideEffect[];
  notes: string;
  redFlag: boolean;
}

export interface Medication {
  id: string;
  patientId: string;
  name: MedicationName | string;
  dose: string;
  startDate: string;
  frequency: string;
  medicationDay: string;
  nextDoseDate: string;
  prescriptionReviewDate: string;
  gpReviewDate: string;
  toleranceNotes: string;
  estimatedDaysRemaining: number;
}

export interface Reminder {
  id: string;
  patientId: string;
  type: ReminderType;
  dueDate: string;
  status: ReminderStatus;
  message: string;
}

export interface ClinicianNote {
  id: string;
  patientId: string;
  date: string;
  note: string;
  plan: string;
  followUpWeeks: number;
}

export interface NonScaleVictory {
  id: string;
  patientId: string;
  date: string;
  victory: string;
}

export type PatientFlag =
  | 'review-overdue'
  | 'prescription-review-due'
  | 'side-effects-logged'
  | 'no-recent-entry'
  | 'rapid-weight-loss'
  | 'weight-regain'
  | 'red-flag-symptom'
  | 'poor-tolerance';

export interface PatientWithFlags extends Patient {
  flags: PatientFlag[];
  latestCheckIn?: CheckIn;
  currentMedication?: Medication;
}

export type AppRole = 'patient' | 'clinician' | null;
