import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#5c7cfa', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-100 border border-surface-300 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-gray-400">{payload[0].value.toFixed(1)}%</p>
    </div>
  );
};

export default function LanguagePie({ data }) {
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data)
      .map(([name, value]) => ({ name, value: typeof value === 'number' ? value : parseFloat(value) || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  if (chartData.length === 0) {
    return <div className="text-gray-600 text-sm py-8 text-center">No language data available.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 justify-center md:flex-col md:gap-1.5">
        {chartData.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-gray-400">{entry.name}</span>
            <span className="text-gray-600 ml-auto">{entry.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
