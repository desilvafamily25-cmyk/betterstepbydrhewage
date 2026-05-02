import { Link } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { useClinicianData } from '../../hooks/usePatientData';
import type { PatientFlag } from '../../types';
import { getPatientFlags } from '../../utils';
import { AlertTriangle, Clock, Pill, Activity, TrendingDown, ArrowUpRight, Flag } from 'lucide-react';

interface FlagGroup {
  flag: PatientFlag;
  label: string;
  description: string;
  icon: typeof AlertTriangle;
  iconColour: string;
  bgColour: string;
  borderColour: string;
  priority: number;
}

const FLAG_GROUPS: FlagGroup[] = [
  {
    flag: 'red-flag-symptom',
    label: 'Red Flag Symptoms',
    description: 'Patients who reported urgent symptoms',
    icon: AlertTriangle,
    iconColour: 'text-red-600',
    bgColour: 'bg-red-50',
    borderColour: 'border-red-300',
    priority: 1,
  },
  {
    flag: 'side-effects-logged',
    label: 'Side Effects Logged',
    description: 'Patients reporting side effects',
    icon: Activity,
    iconColour: 'text-[#B8735E]',
    bgColour: 'bg-[#DCC9B0]/35',
    borderColour: 'border-[#DCC9B0]',
    priority: 2,
  },
  {
    flag: 'review-overdue',
    label: 'Review Overdue',
    description: 'GP review date has passed',
    icon: Clock,
    iconColour: 'text-red-500',
    bgColour: 'bg-red-50',
    borderColour: 'border-red-200',
    priority: 3,
  },
  {
    flag: 'prescription-review-due',
    label: 'Prescription Review Due',
    description: 'Repeat prescription review due soon',
    icon: Pill,
    iconColour: 'text-[#B8735E]',
    bgColour: 'bg-[#DCC9B0]/35',
    borderColour: 'border-[#DCC9B0]',
    priority: 4,
  },
  {
    flag: 'no-recent-entry',
    label: 'No Recent Check-ins',
    description: 'No weight entry for 14+ days',
    icon: TrendingDown,
    iconColour: 'text-[#747B7D]',
    bgColour: 'bg-[#F6F3EE]',
    borderColour: 'border-[#E7E5E1]',
    priority: 5,
  },
  {
    flag: 'weight-regain',
    label: 'Weight Regain',
    description: 'Weight has increased from starting',
    icon: ArrowUpRight,
    iconColour: 'text-[#B8735E]',
    bgColour: 'bg-[#DCC9B0]/35',
    borderColour: 'border-[#DCC9B0]',
    priority: 6,
  },
];

export function ClinicianFlags() {
  const { patients, checkIns, loading } = useClinicianData();

  const patientsWithFlags = patients.map(p => ({
    patient: p,
    flags: getPatientFlags(p, checkIns.filter(c => c.patientId === p.id)) as PatientFlag[],
  }));

  const totalFlags = patientsWithFlags.reduce((sum, { flags }) => sum + flags.length, 0);

  if (loading) {
    return (
      <AppShell role="clinician" title="Clinical Flags">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="clinician" title="Clinical Flags">
      <div className="space-y-5">
        {/* Summary */}
        <div className="flex items-center gap-3 bg-[#0F6D6D] text-white rounded-2xl px-5 py-4">
          <Flag size={20} />
          <div>
            <p className="font-bold">{totalFlags} active flag{totalFlags !== 1 ? 's' : ''}</p>
            <p className="text-white/70 text-xs">Across {patients.length} patients</p>
          </div>
        </div>

        {totalFlags === 0 && (
          <div className="text-center py-12 text-[#747B7D]">
            <Flag size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No flags at this time</p>
            <p className="text-xs mt-1">All patients are on track.</p>
          </div>
        )}

        {/* Flag groups in priority order */}
        {FLAG_GROUPS.map(group => {
          const flaggedPatients = patientsWithFlags.filter(({ flags }) => flags.includes(group.flag));
          if (flaggedPatients.length === 0) return null;

          return (
            <div key={group.flag}>
              <div className={`rounded-2xl border ${group.borderColour} ${group.bgColour} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <group.icon size={18} className={group.iconColour} />
                  <h3 className={`font-semibold text-[#1B3D34]`}>{group.label}</h3>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white ${group.iconColour}`}>
                    {flaggedPatients.length}
                  </span>
                </div>
                <p className="text-xs text-[#3C4346] mb-3">{group.description}</p>

                <div className="space-y-2">
                  {flaggedPatients.map(({ patient }) => (
                    <Link
                      key={patient.id}
                      to={`/clinician/patient/${patient.id}`}
                      className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-white hover:border-[#E7E5E1] shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1B3D34]">{patient.name}</p>
                        <p className="text-xs text-[#747B7D]">{patient.currentWeightKg} kg · Next review {patient.nextReviewDate}</p>
                      </div>
                      <span className="text-[#747B7D]">›</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
