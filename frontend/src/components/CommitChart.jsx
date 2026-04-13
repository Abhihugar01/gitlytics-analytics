import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-100 border border-surface-300 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} commits</p>
    </div>
  );
};

export default function CommitChart({ data }) {
  const [view, setView] = useState('weekly');

  const chartData = useMemo(() => {
    if (!data) return [];
    const source = view === 'daily' ? data.daily : data.weekly;
    if (!source) return [];
    return Object.entries(source)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // last 30 entries
  }, [data, view]);

  if (!data || chartData.length === 0) {
    return <div className="text-gray-600 text-sm py-8 text-center">No commit data available.</div>;
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['weekly', 'daily'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              view === v ? 'bg-brand-500/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#8b949e' }}
            axisLine={{ stroke: '#30363d' }}
            tickLine={false}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#8b949e' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(92, 124, 250, 0.08)' }} />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5c7cfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
