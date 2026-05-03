import { type ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  colour?: 'green' | 'blue' | 'orange' | 'red' | 'neutral';
  large?: boolean;
}

const colourMap = {
  green: 'bg-[#0F6D6D]/10 text-[#0F6D6D] border-[#0F6D6D]/20',
  blue: 'bg-[#0F6D6D]/10 text-[#0F6D6D] border-[#0F6D6D]/20',
  orange: 'bg-[#DCC9B0]/35 text-[#8A4D3C] border-[#DCC9B0]',
  red: 'bg-red-50 text-red-700 border-red-100',
  neutral: 'bg-white text-[#1B3D34] border-[#E7E5E1]',
};

export function StatCard({ label, value, unit, subtext, icon, colour = 'neutral', large }: StatCardProps) {
  return (
    <div className={clsx(
      'rounded-2xl border p-4 flex flex-col gap-1 shadow-sm',
      colourMap[colour]
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium opacity-70">{label}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-1">
        <span className={clsx('font-bold leading-none font-mono-nums', large ? 'text-3xl' : 'text-2xl')}>{value}</span>
        {unit && <span className="text-sm opacity-70 mb-0.5">{unit}</span>}
      </div>
      {subtext && <span className="text-xs opacity-60">{subtext}</span>}
    </div>
  );
}
