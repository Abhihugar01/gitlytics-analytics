import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-100 border border-surface-300 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-white font-semibold">{label}</p>
      <p className="text-gray-400">{payload[0].value} commits</p>
    </div>
  );
};

export default function ContributorsChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(([name, commits]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '…' : name,
      commits,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="text-gray-600 text-sm py-8 text-center">No contributor data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: '#8b949e' }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#c9d1d9' }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(92, 124, 250, 0.08)' }} />
        <Bar dataKey="commits" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
