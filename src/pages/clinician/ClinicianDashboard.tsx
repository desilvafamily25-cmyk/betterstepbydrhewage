import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { PatientCard } from '../../components/PatientCard';
import { useClinicianData } from '../../hooks/usePatientData';
import type { PatientFlag } from '../../types';
import { getPatientFlags } from '../../utils';
import { Search, AlertTriangle, Users } from 'lucide-react';

type FilterType = 'all' | 'review-due' | 'rx-due' | 'side-effects' | 'overdue' | 'red-flags';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'review-due', label: 'Review Due' },
  { value: 'rx-due', label: 'Rx Due' },
  { value: 'side-effects', label: 'Side Effects' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'red-flags', label: 'Red Flags' },
];

export function ClinicianDashboard() {
  const { patients, checkIns, medications, loading } = useClinicianData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const patientsWithFlags = patients.map(p => ({
    patient: p,
    flags: getPatientFlags(p, checkIns.filter(c => c.patientId === p.id)) as PatientFlag[],
    medication: medications.find(m => m.patientId === p.id),
  }));

  const filtered = patientsWithFlags.filter(({ patient, flags }) => {
    const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    switch (filter) {
      case 'review-due': return flags.includes('review-overdue');
      case 'rx-due': return flags.includes('prescription-review-due');
      case 'side-effects': return flags.includes('side-effects-logged');
      case 'overdue': return flags.includes('review-overdue') || flags.includes('no-recent-entry');
      case 'red-flags': return flags.includes('red-flag-symptom');
      default: return true;
    }
  });

  // Sort: red flags first, then by flags count
  filtered.sort((a, b) => {
    if (a.flags.includes('red-flag-symptom') && !b.flags.includes('red-flag-symptom')) return -1;
    if (!a.flags.includes('red-flag-symptom') && b.flags.includes('red-flag-symptom')) return 1;
    return b.flags.length - a.flags.length;
  });

  const redFlagCount = patientsWithFlags.filter(p => p.flags.includes('red-flag-symptom')).length;

  if (loading) {
    return (
      <AppShell role="clinician">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1B3D34] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="clinician">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E7E5E1] bg-white px-4 py-3 shadow-sm">
          <img src="/betterstep-brand-logo.png" alt="BetterStep" className="h-14 w-14 flex-shrink-0 object-contain" />
          <div>
            <p className="font-['Playfair_Display'] text-2xl font-bold leading-none text-[#123B34]">BetterStep</p>
            <p className="text-sm font-semibold text-[#B8735E]">by Dr. Hewage</p>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#1B3D34]">Patient Overview</h1>
          <p className="text-sm text-[#3C4346]">{patients.length} patients · {patientsWithFlags.filter(p => p.flags.length > 0).length} with flags</p>
        </div>

        {/* Red flag alert */}
        {redFlagCount > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-2xl px-4 py-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800">
              {redFlagCount} patient{redFlagCount > 1 ? 's have' : ' has'} red flag symptoms — review urgently.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747B7D]" />
          <input
            className="w-full bg-white border border-[#E7E5E1] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6D6D]"
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === f.value ? 'bg-[#0F6D6D] text-white border-[#0F6D6D]' : 'bg-white text-[#3C4346] border-[#E7E5E1]'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Patient list */}
        {patients.length === 0 ? (
          <div className="text-center py-12 text-[#747B7D]">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No patients enrolled yet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#747B7D]">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No patients match this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ patient, flags, medication }) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                checkIns={checkIns.filter(c => c.patientId === patient.id)}
                medication={medication}
                flags={flags}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
