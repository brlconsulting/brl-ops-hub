import { getUnassigned, PRIORITY_COLORS, PRIORITY_NAMES, ticketUrl } from '../utils/helpers';

export default function UnassignedPanel({ tickets, domain }) {
  const items = getUnassigned(tickets);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>👤</span> Tickets sem Agente
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${items.length === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
          {items.length}
        </span>
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-6">Nenhum ticket sem agente</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Assunto</th>
                <th className="text-left py-2 px-1">Cliente</th>
                <th className="text-left py-2 px-1">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 px-1 text-gray-400 text-xs">
                    <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                      className="hover:text-blue-600">#{t.id}</a>
                  </td>
                  <td className="py-1.5 px-1 max-w-[200px]">
                    <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 truncate block">{t.subject}</a>
                  </td>
                  <td className="py-1.5 px-1 text-gray-500 text-xs truncate max-w-[120px]">
                    {t.requester?.name || '—'}
                  </td>
                  <td className={`py-1.5 px-1 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                    {PRIORITY_NAMES[t.priority] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
