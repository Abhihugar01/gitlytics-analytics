import { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function getColor(count) {
  if (count === 0) return 'bg-surface-200';
  if (count <= 2) return 'bg-emerald-900';
  if (count <= 5) return 'bg-emerald-700';
  if (count <= 10) return 'bg-emerald-500';
  return 'bg-emerald-400';
}

export default function ActivityHeatmap({ repos }) {
  // Generate mock heatmap data based on repo count and stars
  const weeks = useMemo(() => {
    const data = [];
    const now = new Date();
    const totalScore = repos.reduce((s, r) => s + r.stars + r.forks, 0);
    const baseActivity = Math.min(totalScore * 0.01, 5);

    for (let w = 51; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const activity = Math.floor(Math.random() * (isWeekend ? baseActivity * 0.5 : baseActivity * 2));
        week.push({ date: date.toISOString().slice(0, 10), count: Math.max(0, activity) });
      }
      data.push(week);
    }
    return data;
  }, [repos]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-3 min-w-[720px]">
        {/* Month labels */}
        <div className="flex ml-8">
          {MONTHS.map((m) => (
            <span key={m} className="text-[10px] text-gray-600 flex-1">{m}</span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {DAYS.map((d, i) => (
              <span key={i} className="text-[10px] text-gray-600 h-[13px] leading-[13px] w-6">{d}</span>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[13px] h-[13px] rounded-sm ${getColor(day.count)} transition-colors hover:ring-1 hover:ring-white/30`}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 ml-8 mt-1">
          <span className="text-[10px] text-gray-600 mr-1">Less</span>
          {['bg-surface-200', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400'].map((c) => (
            <div key={c} className={`w-[13px] h-[13px] rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-600 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
