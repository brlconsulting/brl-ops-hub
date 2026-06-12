import { groupByCustomer, ticketUrl, PRIORITY_NAMES, PRIORITY_COLORS, STATUS_NAMES } from '../utils/helpers';

export default function OpenByCustomerPanel({ tickets, agents, domain }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));
  const groups   = groupByCustomer(tickets);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      {/* header */}
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

              {/* sub-header do cliente */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700 truncate">{name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {group.length} {group.length === 1 ? 'ticket' : 'tickets'}
                </span>
                <div className="flex-1 border-b border-gray-100" />
              </div>

              {/* tabela */}
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
                    </tr>
                  </thead>
                  <tbody>
                    {group.map(t => (
                      <tr key={t.id}
                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-2">
                          <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-gray-400 font-mono hover:text-blue-600">
                            #{t.id}
                          </a>
                        </td>
                        <td className="py-2 px-2 max-w-[300px]">
                          <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                            className="text-gray-800 font-medium hover:text-blue-600 truncate block">
                            {t.subject}
                          </a>
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
