import { ticketUrl, PRIORITY_COLORS, PRIORITY_NAMES } from '../utils/helpers';

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

export default function ThomsonPanel({ tickets, agents, domain, onTicketClick }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  const items = tickets
    .filter(t => t.status === 7 || t.status === 9)
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>🛠️</span> Ag. Thomson e Em Desenvolvimento
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
          ${items.length === 0 ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
          {items.length}
        </span>
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-6">Nenhum ticket aguardando Thomson ou em desenvolvimento</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b sticky top-0 bg-white">
              <tr>
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Assunto</th>
                <th className="text-left py-2 px-1">Status</th>
                <th className="text-left py-2 px-1">Cliente</th>
                <th className="text-left py-2 px-1">Agente</th>
                <th className="text-left py-2 px-1">Prior.</th>
                <th className="text-left py-2 px-1">Esperando</th>
                <th className="py-2 px-1 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => {
                const waitDays = Math.floor((Date.now() - new Date(t.updated_at)) / 86_400_000);
                const waitCls = waitDays >= 7
                  ? 'text-red-600 font-semibold'
                  : waitDays >= 3
                    ? 'text-orange-500 font-medium'
                    : 'text-gray-500';
                return (
                  <tr key={t.id}
                    className="border-b border-gray-50 hover:bg-teal-50/40 transition-colors cursor-pointer"
                    onClick={() => onTicketClick?.(t)}>
                    <td className="py-1.5 px-1 text-gray-400 text-xs font-mono">#{t.id}</td>
                    <td className="py-1.5 px-1 max-w-[180px]">
                      <span className="text-gray-800 font-medium truncate block">{t.subject}</span>
                    </td>
                    <td className="py-1.5 px-1 text-xs whitespace-nowrap">
                      {t.status === 7
                        ? <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full">Ag. Thomson</span>
                        : <span className="text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-full">Em Desenv.</span>
                      }
                    </td>
                    <td className="py-1.5 px-1 text-xs text-gray-500 truncate max-w-[110px]">
                      {t.requester?.name || '—'}
                    </td>
                    <td className="py-1.5 px-1 text-xs truncate max-w-[100px]">
                      {t.responder_id
                        ? <span className="text-gray-600">{agentMap.get(t.responder_id) || '—'}</span>
                        : <span className="text-amber-500 font-medium">Sem agente</span>
                      }
                    </td>
                    <td className={`py-1.5 px-1 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                      {PRIORITY_NAMES[t.priority] || '—'}
                    </td>
                    <td className={`py-1.5 px-1 text-xs whitespace-nowrap ${waitCls}`}>
                      {waitDays === 0 ? 'hoje' : `${waitDays}d`}
                    </td>
                    <td className="py-1.5 px-1 text-right">
                      <FdBtn domain={domain} id={t.id} />
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
