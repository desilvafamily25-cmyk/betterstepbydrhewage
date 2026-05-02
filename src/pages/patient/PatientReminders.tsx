import { AppShell } from '../../components/AppShell';
import { ReminderCard } from '../../components/ReminderCard';
import { usePatientData } from '../../hooks/usePatientData';
import type { Patient, Medication, Reminder } from '../../types';
import { daysUntil } from '../../utils';
import { Bell, Info } from 'lucide-react';

function buildAutoReminders(patient: Patient, med: Medication | undefined): Reminder[] {
  const reminders: Reminder[] = [];

  const daysToReview = daysUntil(patient.nextReviewDate);
  if (daysToReview <= 14) {
    reminders.push({
      id: `auto-review-${patient.id}`,
      patientId: patient.id,
      type: 'gp-review',
      dueDate: patient.nextReviewDate,
      status: 'pending',
      message: daysToReview < 0
        ? 'Your GP review is overdue. Please book an appointment as soon as possible.'
        : `Your GP review is due in ${daysToReview} day${daysToReview !== 1 ? 's' : ''}. Book now to keep your progress on track.`,
    });
  }

  if (med) {
    const daysToRx = daysUntil(med.prescriptionReviewDate);
    if (daysToRx <= 10) {
      reminders.push({
        id: `auto-rx-${patient.id}`,
        patientId: patient.id,
        type: 'prescription-review',
        dueDate: med.prescriptionReviewDate,
        status: 'pending',
        message: 'Your weight management prescription may need review soon. Please book your GP appointment before your current prescription runs out.',
      });
    }
    if (med.estimatedDaysRemaining <= 7) {
      reminders.push({
        id: `auto-dose-${patient.id}`,
        patientId: patient.id,
        type: 'medication-dose',
        dueDate: med.nextDoseDate,
        status: 'pending',
        message: `You have approximately ${med.estimatedDaysRemaining} days of medication remaining. Contact your GP for a repeat prescription.`,
      });
    }
  }

  return reminders;
}

export function PatientReminders() {
  const { patient, medications, reminders, loading, updateReminderStatus } = usePatientData();

  if (loading) {
    return (
      <AppShell role="patient" title="Reminders">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!patient) return null;

  const med = medications[0];
  const autoReminders = buildAutoReminders(patient, med);

  const allReminders = [
    ...autoReminders.filter(ar => !reminders.some(r => r.id === ar.id)),
    ...reminders,
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const pending = allReminders.filter(r => r.status === 'pending');
  const done = allReminders.filter(r => r.status !== 'pending');

  const handleAcknowledge = (id: string) => updateReminderStatus(id, 'acknowledged');
  const handleDismiss = (id: string) => updateReminderStatus(id, 'dismissed');

  return (
    <AppShell role="patient" title="Reminders">
      <div className="space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
          <Info size={18} className="text-[#0F6D6D] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#0F6D6D] leading-relaxed">
            Reminders are shown in-app. Enable device notifications in your phone settings to receive BetterStep alerts.
          </p>
        </div>

        {/* Pending reminders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-[#1B3D34]" />
            <h3 className="font-semibold text-[#1B3D34]">Active Reminders</h3>
            {pending.length > 0 && (
              <span className="ml-auto bg-[#1B3D34] text-white text-xs rounded-full px-2 py-0.5">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-8 text-[#747B7D]">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active reminders. You're all up to date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onAcknowledge={handleAcknowledge}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>

        {/* Done reminders */}
        {done.length > 0 && (
          <div>
            <h3 className="font-semibold text-[#747B7D] mb-3 text-sm">Completed</h3>
            <div className="space-y-2">
              {done.map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
