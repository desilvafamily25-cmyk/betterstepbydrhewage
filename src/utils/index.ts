import type { CheckIn, Patient } from '../types';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function weightChange(start: number, current: number): number {
  return Math.round((current - start) * 10) / 10;
}

export function percentBodyWeightChange(start: number, current: number): string {
  const pct = ((current - start) / start) * 100;
  return pct.toFixed(1);
}

export function bmi(weightKg: number, heightCm: number): string {
  const bmiVal = weightKg / Math.pow(heightCm / 100, 2);
  return bmiVal.toFixed(1);
}

export function latestCheckIn(checkIns: CheckIn[], patientId: string): CheckIn | undefined {
  return checkIns
    .filter(c => c.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function checkInsForPatient(checkIns: CheckIn[], patientId: string): CheckIn[] {
  return checkIns
    .filter(c => c.patientId === patientId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function daysSinceLastCheckIn(checkIns: CheckIn[], patientId: string): number {
  const latest = latestCheckIn(checkIns, patientId);
  if (!latest) return 999;
  return Math.abs(daysUntil(latest.date));
}

export function urgencyColour(days: number): string {
  if (days < 0) return 'text-red-600';
  if (days <= 3) return 'text-[#8A4D3C]';
  if (days <= 7) return 'text-yellow-600';
  return 'text-[#0F6D6D]';
}

export function urgencyBg(days: number): string {
  if (days < 0) return 'bg-red-50 border-red-200';
  if (days <= 3) return 'bg-[#DCC9B0]/35 border-[#DCC9B0]';
  if (days <= 7) return 'bg-yellow-50 border-yellow-200';
  return 'bg-[#0F6D6D]/10 border-[#0F6D6D]/20';
}

export function getPatientFlags(patient: Patient, checkIns: CheckIn[]): string[] {
  const flags: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  if (patient.nextReviewDate < today) flags.push('review-overdue');
  if (patient.nextPrescriptionReviewDate < today) flags.push('prescription-review-due');
  if (daysUntil(patient.nextPrescriptionReviewDate) <= 7) flags.push('prescription-review-due');

  const latest = latestCheckIn(checkIns, patient.id);
  if (!latest || daysSinceLastCheckIn(checkIns, patient.id) > 14) flags.push('no-recent-entry');
  if (latest?.redFlag) flags.push('red-flag-symptom');
  if (latest?.sideEffects && !latest.sideEffects.includes('none') && latest.sideEffects.length > 0) {
    flags.push('side-effects-logged');
  }

  const patientCheckIns = checkInsForPatient(checkIns, patient.id);
  if (patientCheckIns.length >= 4) {
    const recent = patientCheckIns.slice(-4);
    const gains = recent.filter((c, i) => i > 0 && c.weightKg > recent[i - 1].weightKg);
    if (gains.length >= 3) flags.push('weight-regain');
  }

  if (patient.currentWeightKg > patient.startingWeightKg) flags.push('weight-regain');

  return [...new Set(flags)];
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function scoreLabel(score: number): string {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Moderate';
  return 'Good';
}

export function scoreColour(score: number): string {
  if (score <= 3) return 'text-red-600';
  if (score <= 6) return 'text-yellow-600';
  return 'text-[#0F6D6D]';
}
