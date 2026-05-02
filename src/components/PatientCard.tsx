import { Link } from 'react-router-dom';
import type { Patient, CheckIn, Medication, PatientFlag } from '../types';
import { weightChange, percentBodyWeightChange, daysUntil, latestCheckIn } from '../utils';
import { AlertTriangle, Clock, Activity } from 'lucide-react';
import clsx from 'clsx';

const flagConfig: Record<PatientFlag, { label: string; colour: string }> = {
  'review-overdue': { label: 'Review overdue', colour: 'bg-red-100 text-red-700' },
  'prescription-review-due': { label: 'Rx review due', colour: 'bg-[#DCC9B0]/45 text-[#8A4D3C]' },
  'side-effects-logged': { label: 'Side effects', colour: 'bg-[#DCC9B0]/45 text-[#8A4D3C]' },
  'no-recent-entry': { label: 'No recent log', colour: 'bg-[#E7E5E1] text-[#3C4346]' },
  'rapid-weight-loss': { label: 'Rapid loss', colour: 'bg-[#0F6D6D]/10 text-[#0F6D6D]' },
  'weight-regain': { label: 'Weight regain', colour: 'bg-[#DCC9B0]/45 text-[#8A4D3C]' },
  'red-flag-symptom': { label: 'Red flag', colour: 'bg-red-100 text-red-700' },
  'poor-tolerance': { label: 'Poor tolerance', colour: 'bg-[#DCC9B0]/45 text-[#8A4D3C]' },
};

interface PatientCardProps {
  patient: Patient;
  checkIns: CheckIn[];
  medication?: Medication;
  flags?: PatientFlag[];
}

export function PatientCard({ patient, checkIns, medication, flags = [] }: PatientCardProps) {
  const change = weightChange(patient.startingWeightKg, patient.currentWeightKg);
  const pct = percentBodyWeightChange(patient.startingWeightKg, patient.currentWeightKg);
  const latest = latestCheckIn(checkIns, patient.id);
  const daysToReview = daysUntil(patient.nextReviewDate);

  const hasRedFlag = flags.includes('red-flag-symptom');

  return (
    <Link to={`/clinician/patient/${patient.id}`}
      className={clsx(
        'block rounded-2xl border p-4 shadow-sm bg-white hover:shadow-md transition-shadow',
        hasRedFlag ? 'border-red-300 bg-red-50' : 'border-[#E7E5E1]'
      )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#1B3D34]">{patient.name}</p>
          <p className="text-xs text-[#747B7D]">
            {medication ? `${medication.name} ${medication.dose}` : 'No medication recorded'}
          </p>
        </div>
        {hasRedFlag && <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="text-center bg-[#F6F3EE] rounded-xl p-2">
          <p className="text-lg font-bold text-[#1B3D34]">{patient.currentWeightKg}<span className="text-xs ml-0.5">kg</span></p>
          <p className="text-[10px] text-[#747B7D]">Current</p>
        </div>
        <div className="text-center bg-[#F6F3EE] rounded-xl p-2">
          <p className={clsx('text-lg font-bold', change <= 0 ? 'text-[#0F6D6D]' : 'text-red-500')}>
            {change > 0 ? '+' : ''}{change}<span className="text-xs ml-0.5">kg</span>
          </p>
          <p className="text-[10px] text-[#747B7D]">Change</p>
        </div>
        <div className="text-center bg-[#F6F3EE] rounded-xl p-2">
          <p className={clsx('text-lg font-bold', parseFloat(pct) <= 0 ? 'text-[#0F6D6D]' : 'text-red-500')}>
            {parseFloat(pct) > 0 ? '+' : ''}{pct}<span className="text-xs ml-0.5">%</span>
          </p>
          <p className="text-[10px] text-[#747B7D]">%BW</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-[#3C4346]">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {latest ? `Logged ${latest.date}` : 'No entries'}
        </span>
        <span className="flex items-center gap-1">
          <Activity size={11} />
          GP review {daysToReview < 0 ? `${Math.abs(daysToReview)}d overdue` : `in ${daysToReview}d`}
        </span>
      </div>

      {flags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flags.slice(0, 4).map(flag => (
            <span key={flag} className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', flagConfig[flag].colour)}>
              {flagConfig[flag].label}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
