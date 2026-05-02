import { Link } from 'react-router-dom';
import { AppShell, PatientMoreLinks } from '../../components/AppShell';
import { StatCard } from '../../components/StatCard';
import { MedicationCard } from '../../components/MedicationCard';
import { ReminderCard } from '../../components/ReminderCard';
import { SafetyAlert } from '../../components/SafetyAlert';
import { usePatientData } from '../../hooks/usePatientData';
import { weightChange, percentBodyWeightChange, daysUntil, formatDate, latestCheckIn } from '../../utils';
import { ClipboardList, TrendingUp, Pill, FileText, Calendar, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../config';

export function PatientHome() {
  const { patient, checkIns, medications, reminders, loading, updateReminderStatus } = usePatientData();

  const medication = medications[0];
  const latest = patient ? latestCheckIn(checkIns, patient.id) : undefined;
  const patientReminders = reminders.filter(r => r.status === 'pending');

  const handleAcknowledge = (id: string) => updateReminderStatus(id, 'acknowledged');

  if (loading) {
    return (
      <AppShell role="patient">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!patient) return null;

  const change = weightChange(patient.startingWeightKg, patient.currentWeightKg);
  const pct = percentBodyWeightChange(patient.startingWeightKg, patient.currentWeightKg);
  const daysToReview = daysUntil(patient.nextReviewDate);
  const daysToRx = medication ? daysUntil(medication.prescriptionReviewDate) : null;
  const firstName = patient.name.split(' ')[0];
  const hasRedFlag = latest?.redFlag;

  const quickActions = [
    { to: '/patient/check-in', icon: ClipboardList, label: 'Log today', colour: 'bg-[#1B3D34]' },
    { to: '/patient/medication', icon: Pill, label: 'Medication', colour: 'bg-[#0F6D6D]' },
    { to: '/patient/progress', icon: TrendingUp, label: 'Progress', colour: 'bg-[#0F6D6D]' },
    { to: '/patient/review-summary', icon: FileText, label: 'GP summary', colour: 'bg-[#1B3D34]' },
    { to: '/patient/book-review', icon: Calendar, label: 'Book review', colour: 'bg-[#1B3D34]' },
  ];

  return (
    <AppShell role="patient">
      <div className="space-y-5">
        {/* Red flag alert */}
        {hasRedFlag && (
          <SafetyAlert
            type="red-flag"
            message="You logged a red flag symptom recently. If you are seriously unwell, call 000 or attend your nearest emergency department. For non-urgent concerns, contact your GP."
            showEmergency
          />
        )}

        {/* Welcome */}
        <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] rounded-2xl px-5 py-5 text-white">
          <p className="text-white/70 text-sm font-medium">Welcome back,</p>
          <h2 className="text-2xl font-bold mt-0.5">{firstName}</h2>
          <p className="text-white/80 text-sm mt-1">
            {latest ? `Last logged: ${formatDate(latest.date)}` : 'Start your first check-in today'}
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Current Weight"
            value={patient.currentWeightKg}
            unit="kg"
            subtext={`Started at ${patient.startingWeightKg} kg`}
            colour="neutral"
          />
          <StatCard
            label="Total Change"
            value={`${change > 0 ? '+' : ''}${change}`}
            unit="kg"
            subtext={`${parseFloat(pct) > 0 ? '+' : ''}${pct}% body weight`}
            colour={change < 0 ? 'green' : change > 0 ? 'orange' : 'neutral'}
          />
          <StatCard
            label="GP Review"
            value={daysToReview < 0 ? 'Overdue' : daysToReview === 0 ? 'Today' : `${daysToReview} days`}
            subtext={formatDate(patient.nextReviewDate)}
            colour={daysToReview < 0 ? 'red' : daysToReview <= 7 ? 'orange' : 'neutral'}
          />
          <StatCard
            label="Repeat Prescription"
            value={daysToRx == null ? '—' : daysToRx < 0 ? 'Overdue' : `${daysToRx} days`}
            subtext={medication ? formatDate(medication.prescriptionReviewDate) : 'Not set'}
            colour={daysToRx != null && daysToRx <= 7 ? 'red' : 'neutral'}
          />
        </div>

        {/* Motivational card */}
        <div className="bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-2xl p-4 flex gap-3">
          <Sparkles size={20} className="text-[#B8735E] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#8A4D3C] leading-relaxed">
            Small, consistent steps matter. Your trend over weeks is more important than one day's number.
          </p>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-[#3C4346] mb-3 uppercase tracking-wide">Quick Actions</h3>
          <div className="grid grid-cols-5 gap-2">
            {quickActions.map(({ to, icon: Icon, label, colour }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colour}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] text-center text-[#3C4346] leading-tight font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* More links */}
        <div>
          <h3 className="text-sm font-semibold text-[#3C4346] mb-2 uppercase tracking-wide">More</h3>
          <PatientMoreLinks />
        </div>

        {/* Current medication */}
        {medication && (
          <div>
            <h3 className="text-sm font-semibold text-[#3C4346] mb-3 uppercase tracking-wide">Current Medication</h3>
            <MedicationCard medication={medication} compact />
          </div>
        )}

        {/* Reminders */}
        {patientReminders.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#3C4346] mb-3 uppercase tracking-wide">Reminders</h3>
            <div className="space-y-2">
              {patientReminders.slice(0, 3).map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} onAcknowledge={handleAcknowledge} />
              ))}
            </div>
          </div>
        )}

        {/* Book review CTA */}
        <a
          href={APP_CONFIG.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#1B3D34] text-white rounded-2xl px-5 py-4 text-base font-semibold shadow-md w-full"
        >
          <Calendar size={18} />
          {APP_CONFIG.bookingButtonText}
        </a>
      </div>
    </AppShell>
  );
}
