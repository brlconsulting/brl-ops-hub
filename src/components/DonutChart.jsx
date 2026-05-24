export default function BarChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const max   = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex flex-col gap-1">

      {/* header: title + total */}
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
        <span className="text-xl font-extrabold text-gray-800 tabular-nums">{total}</span>
      </div>

      {/* rows */}
      {total === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">Sem dados</p>
      )}

      <ul className="space-y-2.5">
        {data.map((item, i) => {
          const barPct = (item.value / max) * 100;
          const pct    = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={i} className="flex items-center gap-2">

              {/* color dot */}
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: item.color }}
              />

              {/* label */}
              <span
                className="text-xs font-semibold text-gray-700 truncate shrink-0"
                style={{ width: 108 }}
                title={item.label}
              >
                {item.label}
              </span>

              {/* bar track */}
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5"
                  style={{ width: `${barPct}%`, background: item.color, minWidth: item.value > 0 ? 16 : 0 }}
                >
                  {barPct > 18 && (
                    <span className="text-[10px] font-bold text-white leading-none">
                      {pct}%
                    </span>
                  )}
                </div>
              </div>

              {/* value badge */}
              <span
                className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full shrink-0 min-w-[26px] text-center"
                style={{ background: item.color + '22', color: item.color }}
              >
                {item.value}
              </span>

            </li>
          );
        })}
      </ul>

    </div>
  );
}
