import { getSLAViolated, PRIORITY_COLORS, PRIORITY_NAMES, dueDateLabel, ticketUrl } from '../utils/helpers';

export default function SLAPanel({ tickets, domain }) {
  const items = getSLAViolated(tickets).sort(
    (a, b) => new Date(a.due_by) - new Date(b.due_by)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>🚨</span> SLA Violado
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${items.length === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-800'}`}>
          {items.length}
        </span>
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-6">Nenhum SLA violado</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Assunto</th>
                <th className="text-left py-2 px-1">Atraso</th>
                <th className="text-left py-2 px-1">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const due = dueDateLabel(t.due_by);
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-red-50">
                    <td className="py-1.5 px-1 text-gray-400 text-xs">
                      <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                        className="hover:text-blue-600">#{t.id}</a>
                    </td>
                    <td className="py-1.5 px-1 max-w-[180px]">
                      <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                        className="text-gray-700 hover:text-blue-600 truncate block">{t.subject}</a>
                    </td>
                    <td className={`py-1.5 px-1 text-xs whitespace-nowrap ${due.cls}`}>
                      {due.text}
                    </td>
                    <td className={`py-1.5 px-1 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                      {PRIORITY_NAMES[t.priority] || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
