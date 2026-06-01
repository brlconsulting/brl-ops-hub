import { getDisplayMonth } from '../api/freshdesk';

// Converte "HH:MM" → minutos
function toMins(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Minutos → "HH:MM"
function toHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Extrai o dia do mês da string ISO sem depender de timezone
function dayOf(isoStr) {
  return isoStr ? parseInt(isoStr.split('T')[0].split('-')[2], 10) : null;
}

export default function TimeMatrixPanel({ timeEntries, agents, loading }) {
  const now = new Date();
  const { year, month } = getDisplayMonth(); // month é 1-indexed

  // "hoje" só faz sentido se estamos exibindo o mês atual
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const today       = isCurrentMonth ? now.getDate() : -1; // -1 = sem destaque
  const currentDay  = now.getDate();

  const daysInMonth = new Date(year, month, 0).getDate(); // last day of month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthLabel = new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Mapa agentId → nome
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  // Constrói a matriz: matrix[agentId][day] = minutos
  const matrix      = {};
  const agentTotals = {};
  const dayTotals   = {};

  for (const entry of timeEntries) {
    const agentId = entry.agent_id;
    const day     = dayOf(entry.executed_at);
    const mins    = toMins(entry.time_spent);
    if (!day || mins === 0) continue;

    if (!matrix[agentId]) matrix[agentId] = {};
    matrix[agentId][day]  = (matrix[agentId][day]  || 0) + mins;
    agentTotals[agentId]  = (agentTotals[agentId]  || 0) + mins;
    dayTotals[day]        = (dayTotals[day]         || 0) + mins;
  }

  // Agentes com pelo menos uma entrada, ordenados por nome
  const activeIds = Object.keys(matrix)
    .map(Number)
    .sort((a, b) => (agentMap.get(a) || '').localeCompare(agentMap.get(b) || ''));

  const grandTotal = Object.values(agentTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      {/* header */}
      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>🕐</span> Horas por Consultor
        <span className="text-xs font-normal text-gray-400 ml-0.5 capitalize">{monthLabel}</span>
        {loading && (
          <span className="ml-2 text-xs text-blue-400 animate-pulse">carregando…</span>
        )}
        {!loading && grandTotal > 0 && (
          <span className="ml-auto text-xs font-normal bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {toHHMM(grandTotal)} total
          </span>
        )}
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10 animate-pulse">
          Carregando horas registradas…
        </p>
      ) : activeIds.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          Nenhuma hora registrada neste mês
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="text-xs border-collapse" style={{ minWidth: `${140 + daysInMonth * 54 + 64}px` }}>

            {/* ── cabeçalho de dias ── */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 z-20 bg-gray-50 text-left py-2.5 px-3 font-semibold text-gray-600
                               min-w-[140px] border-r border-gray-200">
                  Agente
                </th>
                {days.map(d => (
                  <th key={d}
                    className={`py-2.5 px-1 text-center font-semibold w-[54px] whitespace-nowrap
                      ${d === today ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>
                    {String(d).padStart(2, '0')}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center font-bold text-gray-700 bg-gray-100
                               border-l border-gray-200 min-w-[64px] sticky right-0 z-20">
                  Total
                </th>
              </tr>
            </thead>

            {/* ── linhas por agente ── */}
            <tbody>
              {activeIds.map((agentId, rowIdx) => {
                const agentDays = matrix[agentId] || {};
                const total     = agentTotals[agentId] || 0;
                return (
                  <tr key={agentId}
                    className={`border-b border-gray-100 hover:bg-slate-50 transition-colors
                      ${rowIdx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                    <td className={`sticky left-0 z-10 py-2.5 px-3 font-medium text-gray-700
                                    border-r border-gray-200
                                    ${rowIdx % 2 === 1 ? 'bg-gray-50/80' : 'bg-white'}`}>
                      {agentMap.get(agentId) || `Agente ${agentId}`}
                    </td>
                    {days.map(d => {
                      const mins    = agentDays[d] || 0;
                      const isToday = d === today;
                      // Passado: mês anterior = todos os dias; mês atual = antes de hoje
                      const isPast  = !isCurrentMonth || d < currentDay;
                      let cellCls = 'text-gray-300'; // futuro sem entrada
                      if (isToday)       cellCls = mins > 0 ? 'text-blue-700 font-semibold' : 'text-blue-300';
                      else if (mins > 0) cellCls = 'text-gray-700';
                      else if (isPast)   cellCls = 'text-red-300'; // dia passado sem horas
                      return (
                        <td key={d}
                          className={`py-2.5 px-1 text-center whitespace-nowrap
                            ${isToday ? 'bg-blue-50' : ''} ${cellCls}`}>
                          {mins > 0 ? toHHMM(mins) : '—'}
                        </td>
                      );
                    })}
                    <td className={`py-2.5 px-3 text-center font-bold text-gray-800
                                    border-l border-gray-200 bg-gray-50 sticky right-0 z-10`}>
                      {toHHMM(total)}
                    </td>
                  </tr>
                );
              })}

              {/* ── linha de totais por dia ── */}
              <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="sticky left-0 z-10 bg-gray-100 py-2.5 px-3 text-gray-600
                               border-r border-gray-200">
                  Total
                </td>
                {days.map(d => (
                  <td key={d}
                    className={`py-2.5 px-1 text-center text-gray-600
                      ${d === today ? 'bg-blue-100 text-blue-700' : ''}`}>
                    {dayTotals[d] ? toHHMM(dayTotals[d]) : '—'}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-center font-bold text-gray-900
                               border-l border-gray-300 bg-gray-200 sticky right-0 z-10">
                  {toHHMM(grandTotal)}
                </td>
              </tr>
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
