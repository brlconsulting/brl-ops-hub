import { groupByAgent, groupByCustomer, STATUS_NAMES, volumeColor } from '../utils/helpers';

function Bar({ label, count, max, badgeCls }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-32 truncate text-gray-700 text-xs">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full bg-blue-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center ${badgeCls}`}>
        {count}
      </span>
    </div>
  );
}

export default function TotalsSection({ tickets, agents }) {
  const byStatus = {};
  for (const t of tickets) byStatus[t.status] = (byStatus[t.status] || 0) + 1;

  const agentGroups = groupByAgent(tickets, agents).slice(0, 10);
  const customerGroups = groupByCustomer(tickets).slice(0, 10);

  const maxAgent = agentGroups[0]?.tickets.length || 1;
  const maxCustomer = customerGroups[0]?.tickets.length || 1;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>📊</span> Totalizadores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* By Status */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wide">Por Status</h3>
          <div className="space-y-2">
            {Object.entries(byStatus).map(([status, count]) => {
              const colors = volumeColor(count);
              return (
                <Bar
                  key={status}
                  label={STATUS_NAMES[status] || `Status ${status}`}
                  count={count}
                  max={tickets.length}
                  badgeCls={colors.badge}
                />
              );
            })}
            {Object.keys(byStatus).length === 0 && (
              <p className="text-sm text-gray-400">Sem dados</p>
            )}
          </div>
        </div>

        {/* By Agent */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wide">Por Agente (top 10)</h3>
          <div className="space-y-2">
            {agentGroups.map((g) => {
              const colors = volumeColor(g.tickets.length);
              return (
                <Bar key={g.id} label={g.name} count={g.tickets.length} max={maxAgent} badgeCls={colors.badge} />
              );
            })}
            {agentGroups.length === 0 && <p className="text-sm text-gray-400">Sem dados</p>}
          </div>
        </div>

        {/* By Customer */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wide">Por Cliente (top 10)</h3>
          <div className="space-y-2">
            {customerGroups.map((g) => {
              const colors = volumeColor(g.tickets.length);
              return (
                <Bar key={g.id} label={g.name} count={g.tickets.length} max={maxCustomer} badgeCls={colors.badge} />
              );
            })}
            {customerGroups.length === 0 && <p className="text-sm text-gray-400">Sem dados</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
