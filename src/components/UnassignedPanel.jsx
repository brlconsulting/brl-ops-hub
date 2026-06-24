import { getUnassigned, PRIORITY_COLORS, PRIORITY_NAMES, ticketUrl } from '../utils/helpers';

function FdBtn({ domain, id }) {
  return (
    <a
      href={ticketUrl(domain, id)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      title="Abrir no FreshDesk"
      className="inline-flex text-gray-300 hover:text-blue-500 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

export default function UnassignedPanel({ tickets, domain, onTicketClick }) {
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
                <th className="py-2 px-1 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTicketClick?.(t)}>
                  <td className="py-1.5 px-1 text-gray-400 text-xs font-mono">#{t.id}</td>
                  <td className="py-1.5 px-1 max-w-[200px]">
                    <span className="text-gray-700 truncate block">{t.subject}</span>
                  </td>
                  <td className="py-1.5 px-1 text-gray-500 text-xs truncate max-w-[120px]">
                    {t.requester?.name || '—'}
                  </td>
                  <td className={`py-1.5 px-1 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                    {PRIORITY_NAMES[t.priority] || '—'}
                  </td>
                  <td className="py-1.5 px-1 text-right">
                    <FdBtn domain={domain} id={t.id} />
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
