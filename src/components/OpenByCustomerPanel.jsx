import { groupByCustomer, ticketUrl, PRIORITY_NAMES, PRIORITY_COLORS, STATUS_NAMES } from '../utils/helpers';

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

export default function OpenByCustomerPanel({ tickets, agents, domain, onTicketClick }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));
  const groups   = groupByCustomer(tickets);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>🏢</span> Tickets Abertos por Cliente
        <span className="ml-auto text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} · {groups.length} clientes
        </span>
      </h2>

      {groups.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm">Nenhum ticket aberto no momento</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ id, name, tickets: group }) => (
            <div key={id}>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700 truncate">{name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {group.length} {group.length === 1 ? 'ticket' : 'tickets'}
                </span>
                <div className="flex-1 border-b border-gray-100" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase border-b">
                    <tr>
                      <th className="text-left py-1.5 px-2">#</th>
                      <th className="text-left py-1.5 px-2">Descrição</th>
                      <th className="text-left py-1.5 px-2">Status</th>
                      <th className="text-left py-1.5 px-2">Agente</th>
                      <th className="text-left py-1.5 px-2">Usuário</th>
                      <th className="text-left py-1.5 px-2">Prioridade</th>
                      <th className="py-1.5 px-2 w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map(t => (
                      <tr key={t.id}
                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => onTicketClick?.(t)}>
                        <td className="py-2 px-2 text-xs text-gray-400 font-mono">#{t.id}</td>
                        <td className="py-2 px-2 max-w-[300px]">
                          <span className="text-gray-800 font-medium truncate block">{t.subject}</span>
                        </td>
                        <td className="py-2 px-2 text-xs whitespace-nowrap text-gray-500">
                          {STATUS_NAMES[t.status] || `Status ${t.status}`}
                        </td>
                        <td className="py-2 px-2 text-xs truncate max-w-[130px]">
                          {t.responder_id
                            ? <span className="text-gray-600">{agentMap.get(t.responder_id) || '—'}</span>
                            : <span className="text-amber-500 font-medium">Sem agente</span>
                          }
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[130px]">
                          {t.requester?.name || t.requester?.email || '—'}
                        </td>
                        <td className={`py-2 px-2 text-xs whitespace-nowrap ${PRIORITY_COLORS[t.priority]}`}>
                          {PRIORITY_NAMES[t.priority] || '—'}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <FdBtn domain={domain} id={t.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
