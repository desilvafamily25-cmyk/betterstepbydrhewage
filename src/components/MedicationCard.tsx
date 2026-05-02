import { Pill, AlertTriangle } from 'lucide-react';
import type { Medication } from '../types';
import { formatDate, daysUntil } from '../utils';
import clsx from 'clsx';

interface MedicationCardProps {
  medication: Medication;
  compact?: boolean;
}

export function MedicationCard({ medication, compact }: MedicationCardProps) {
  const daysToRx = daysUntil(medication.prescriptionReviewDate);
  const daysToGP = daysUntil(medication.gpReviewDate);
  const daysToNext = daysUntil(medication.nextDoseDate);
  const rxUrgent = daysToRx <= 7;
  const rxOverdue = daysToRx < 0;

  if (compact) {
    return (
      <div className="rounded-2xl border border-[#E7E5E1] bg-white p-4 shadow-sm flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1B3D34]/10 flex items-center justify-center flex-shrink-0">
          <Pill size={18} className="text-[#1B3D34]" />
        </div>
        <div>
          <p className="font-semibold text-[#1B3D34]">{medication.name}</p>
          <p className="text-sm text-[#3C4346]">{medication.dose} · {medication.frequency}</p>
          <p className="text-xs text-[#747B7D] mt-0.5">Next dose: {medication.medicationDay}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7E5E1] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B3D34] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Pill size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{medication.name}</p>
            <p className="text-white/80 text-sm">{medication.dose} · {medication.frequency}</p>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className={clsx('rounded-xl p-3 border', daysToNext <= 1 ? 'bg-[#DCC9B0]/35 border-[#DCC9B0]' : 'bg-[#F6F3EE] border-[#E7E5E1]')}>
          <p className="text-xs text-[#747B7D] font-medium">Next Dose</p>
          <p className="text-sm font-semibold text-[#1B3D34] mt-0.5">{medication.medicationDay}</p>
          <p className="text-xs text-[#3C4346]">{formatDate(medication.nextDoseDate)}</p>
        </div>

        <div className={clsx('rounded-xl p-3 border', rxOverdue ? 'bg-red-50 border-red-200' : rxUrgent ? 'bg-[#DCC9B0]/35 border-[#DCC9B0]' : 'bg-[#F6F3EE] border-[#E7E5E1]')}>
          <p className="text-xs font-medium" style={{ color: rxOverdue ? '#d64045' : rxUrgent ? '#8A4D3C' : '#747B7D' }}>
            Repeat Prescription
          </p>
          <p className="text-sm font-semibold text-[#1B3D34] mt-0.5">
            {rxOverdue ? 'Overdue' : `${daysToRx} days`}
          </p>
          <p className="text-xs text-[#3C4346]">{formatDate(medication.prescriptionReviewDate)}</p>
        </div>

        <div className={clsx('rounded-xl p-3 border', daysToGP <= 7 ? 'bg-[#0F6D6D]/10 border-[#0F6D6D]/20' : 'bg-[#F6F3EE] border-[#E7E5E1]')}>
          <p className="text-xs text-[#747B7D] font-medium">GP Review</p>
          <p className="text-sm font-semibold text-[#1B3D34] mt-0.5">{daysToGP <= 0 ? 'Overdue' : `${daysToGP} days`}</p>
          <p className="text-xs text-[#3C4346]">{formatDate(medication.gpReviewDate)}</p>
        </div>

        <div className={clsx('rounded-xl p-3 border', medication.estimatedDaysRemaining <= 5 ? 'bg-red-50 border-red-200' : 'bg-[#F6F3EE] border-[#E7E5E1]')}>
          <div className="flex items-center gap-1">
            <p className="text-xs text-[#747B7D] font-medium">Est. Remaining</p>
            {medication.estimatedDaysRemaining <= 5 && <AlertTriangle size={12} className="text-red-500" />}
          </div>
          <p className="text-sm font-semibold text-[#1B3D34] mt-0.5">{medication.estimatedDaysRemaining} days</p>
        </div>
      </div>

      {medication.toleranceNotes && (
        <div className="px-4 pb-4">
          <div className="bg-[#f0f9f5] rounded-xl p-3 border border-[#0F6D6D]/20">
            <p className="text-xs text-[#3C4346] font-medium">Tolerance Notes</p>
            <p className="text-sm text-[#1B3D34] mt-0.5">{medication.toleranceNotes}</p>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-[#DCC9B0]/35 rounded-xl p-3 border border-[#DCC9B0]">
          <AlertTriangle size={14} className="text-[#B8735E] flex-shrink-0" />
          <p className="text-xs text-[#8A4D3C]">Medication changes must be discussed with your GP.</p>
        </div>
      </div>
    </div>
  );
}
