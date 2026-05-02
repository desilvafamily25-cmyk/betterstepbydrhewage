import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart,
} from 'recharts';
import type { CheckIn } from '../types';
import { formatDateShort } from '../utils';

interface ProgressChartProps {
  checkIns: CheckIn[];
  goalWeight?: number;
  dataKey?: 'weightKg' | 'waistCm';
  label?: string;
  colour?: string;
}

export function ProgressChart({
  checkIns,
  goalWeight,
  dataKey = 'weightKg',
  label = 'Weight (kg)',
  colour = '#1B3D34',
}: ProgressChartProps) {
  const data = checkIns
    .filter(c => c[dataKey] != null)
    .map(c => ({
      date: formatDateShort(c.date),
      value: c[dataKey],
      fullDate: c.date,
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[#747B7D] text-sm">
        No data yet — start checking in to see your progress.
      </div>
    );
  }

  const values = data.map(d => d.value as number).filter(Boolean);
  const minVal = Math.min(...values) - 2;
  const maxVal = Math.max(...values) + 2;

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colour} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colour} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#747B7D' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fontSize: 10, fill: '#747B7D' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #E7E5E1',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(val) => [`${val} ${dataKey === 'weightKg' ? 'kg' : 'cm'}`, label]}
          />
          {goalWeight && dataKey === 'weightKg' && (
            <ReferenceLine y={goalWeight} stroke="#B8735E" strokeDasharray="5 5"
              label={{ value: 'Goal', fill: '#B8735E', fontSize: 10 }} />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2.5}
            fill={`url(#grad-${dataKey})`}
            dot={{ fill: colour, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ScoreTrendProps {
  checkIns: CheckIn[];
  dataKey: 'appetiteScore' | 'energyScore' | 'moodScore' | 'sleepScore';
  label: string;
  colour: string;
}

export function ScoreTrendChart({ checkIns, dataKey, label, colour }: ScoreTrendProps) {
  const data = checkIns.slice(-12).map(c => ({
    date: formatDateShort(c.date),
    value: c[dataKey],
  }));

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#747B7D' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#747B7D' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px', border: '1px solid #E7E5E1' }}
            formatter={(val) => [val as number, label]} />
          <Line type="monotone" dataKey="value" stroke={colour} strokeWidth={2} dot={{ r: 2, fill: colour }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
