import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface SiteLog {
  site: string;
  date: string;
}

const SITE_GROUPS = [
  {
    label: 'Abdomen',
    note: 'Most commonly used — rotate between all four quadrants',
    sites: [
      { id: 'abd-l-upper', label: 'Left upper' },
      { id: 'abd-r-upper', label: 'Right upper' },
      { id: 'abd-l-lower', label: 'Left lower' },
      { id: 'abd-r-lower', label: 'Right lower' },
    ],
  },
  {
    label: 'Thighs',
    note: 'Outer thigh only — avoid inner thigh',
    sites: [
      { id: 'thigh-l', label: 'Left outer thigh' },
      { id: 'thigh-r', label: 'Right outer thigh' },
    ],
  },
  {
    label: 'Upper Arms',
    note: 'Outer area only — may need assistance',
    sites: [
      { id: 'arm-l', label: 'Left outer arm' },
      { id: 'arm-r', label: 'Right outer arm' },
    ],
  },
];

const ALL_SITES = SITE_GROUPS.flatMap(g => g.sites);

function formatRelativeDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return then.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function InjectionSiteTracker() {
  const [log, setLog] = useLocalStorage<SiteLog[]>('bs_injection_log', []);
  const [selected, setSelected] = useState<string | null>(null);
  const [justLogged, setJustLogged] = useState(false);

  // Build last-used date per site
  const lastUsedMap: Record<string, string> = {};
  log.forEach(entry => {
    if (!lastUsedMap[entry.site] || entry.date > lastUsedMap[entry.site]) {
      lastUsedMap[entry.site] = entry.date;
    }
  });

  const mostRecentSite = log.length > 0 ? log[log.length - 1].site : null;

  // Suggest site used least recently (or never used first)
  const neverUsed = ALL_SITES.find(s => !lastUsedMap[s.id]);
  const suggestedId = neverUsed
    ? neverUsed.id
    : ALL_SITES.slice().sort((a, b) =>
        (lastUsedMap[a.id] ?? '') < (lastUsedMap[b.id] ?? '') ? -1 : 1
      )[0]?.id;

  const logInjection = () => {
    if (!selected) return;
    const today = new Date().toISOString().split('T')[0];
    setLog(prev => [...prev, { site: selected, date: today }]);
    setJustLogged(true);
    setTimeout(() => { setJustLogged(false); setSelected(null); }, 2200);
  };

  const selectedLabel = ALL_SITES.find(s => s.id === selected)?.label;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#1B3D34] to-[#0F6D6D] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <RotateCcw size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Injection Site Rotation</p>
          <p className="text-white/70 text-xs">Rotate sites to prevent lumps and improve absorption</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {log.length === 0 && (
          <div className="bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-xl p-3">
            <p className="text-sm text-[#0F6D6D] leading-relaxed">
              Tap a site after each injection to track your rotation. Rotating prevents skin changes that reduce medication absorption.
            </p>
          </div>
        )}

        {SITE_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide">{group.label}</p>
            <p className="text-xs text-[#747B7D] mb-2 mt-0.5">{group.note}</p>
            <div className="grid grid-cols-2 gap-2">
              {group.sites.map(site => {
                const lastUsed = lastUsedMap[site.id];
                const isMostRecent = site.id === mostRecentSite && log.length > 0;
                const isSuggested = site.id === suggestedId && !isMostRecent;
                const isSelected = site.id === selected;
                return (
                  <button
                    key={site.id}
                    onClick={() => setSelected(isSelected ? null : site.id)}
                    className={clsx(
                      'rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-[#1B3D34] bg-[#1B3D34]/10 ring-2 ring-[#1B3D34]/30'
                        : isMostRecent
                        ? 'border-red-200 bg-red-50'
                        : isSuggested
                        ? 'border-[#0F6D6D]/40 bg-[#0F6D6D]/10'
                        : 'border-[#E7E5E1] bg-[#F6F3EE]'
                    )}
                  >
                    <p className="text-xs font-semibold text-[#1B3D34]">{site.label}</p>
                    {isMostRecent && (
                      <p className="text-[10px] font-semibold text-red-600 mt-0.5">Last used — avoid</p>
                    )}
                    {isSuggested && (
                      <p className="text-[10px] font-semibold text-[#0F6D6D] mt-0.5">Recommended next ✓</p>
                    )}
                    {lastUsed && !isMostRecent && !isSuggested && (
                      <p className="text-[10px] text-[#747B7D] mt-0.5">{formatRelativeDate(lastUsed)}</p>
                    )}
                    {!lastUsed && !isSuggested && (
                      <p className="text-[10px] text-[#747B7D] mt-0.5">Not yet used</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {selected && !justLogged && (
          <button
            onClick={logInjection}
            className="w-full bg-[#1B3D34] text-white rounded-xl py-3 text-sm font-semibold"
          >
            Record injection — {selectedLabel}
          </button>
        )}

        {justLogged && (
          <div className="flex items-center justify-center gap-2 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-xl py-3">
            <CheckCircle2 size={16} className="text-[#0F6D6D]" />
            <span className="text-sm font-semibold text-[#0F6D6D]">Injection logged!</span>
          </div>
        )}

        {log.length > 0 && (
          <div className="border-t border-[#E7E5E1] pt-3">
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-2">Recent history</p>
            <div className="space-y-1.5">
              {[...log].reverse().slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[#1B3D34] font-medium">
                    {ALL_SITES.find(s => s.id === entry.site)?.label ?? entry.site}
                  </span>
                  <span className="text-[#747B7D]">{formatRelativeDate(entry.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
