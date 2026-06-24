import { ticketUrl, PRIORITY_NAMES, PRIORITY_COLORS } from '../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_LABEL = {
  10: 'Andamento',
  11: 'Proposta',
  12: 'Parado',
  2:  'Em Análise',
  3:  'Ag. Resposta',
  6:  'Ag. Cliente',
  7:  'Ag. Thomson',
  8:  'Ativ. Agendada',
  9:  'Em Desenvolvimento',
};

const STATUS_STYLE = {
  10: 'bg-indigo-100 text-indigo-700',
  11: 'bg-pink-100 text-pink-700',
  12: 'bg-red-100 text-red-700',
  2:  'bg-blue-100 text-blue-700',
  3:  'bg-violet-100 text-violet-700',
  6:  'bg-amber-100 text-amber-700',
  7:  'bg-teal-100 text-teal-700',
  8:  'bg-orange-100 text-orange-700',
  9:  'bg-cyan-100 text-cyan-700',
};

function groupByStatus(tickets) {
  const groups = {};
  for (const t of tickets) {
    const s = t.status;
    if (!groups[s]) groups[s] = [];
    groups[s].push(t);
  }
  const order = [10, 12, 11, 9, 8, 2, 3, 6, 7];
  return order
    .filter(s => groups[s]?.length > 0)
    .map(s => ({ status: s, tickets: groups[s] }));
}

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

export default function ProjectsPanel({ tickets, agents, domain, onTicketClick }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));
  const grouped = groupByStatus(tickets);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>🗂️</span> Projetos
        <span className="ml-auto text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </h2>

      {tickets.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📁</p>
          <p className="text-sm">Nenhum projeto ativo no momento</p>
          <p className="text-xs mt-1 text-gray-300">
            Tickets atribuídos ao grupo PROJETOS aparecem aqui
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ status, tickets: group }) => (
            <div key={status}>

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[status] || `Status ${status}`}
                </span>
                <span className="text-xs text-gray-400">{group.length} ticket{group.length > 1 ? 's' : ''}</span>
                <div className="flex-1 border-b border-gray-100" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase border-b">
                    <tr>
                      <th className="text-left py-1.5 px-2">#</th>
                      <th className="text-left py-1.5 px-2">Assunto</th>
                      <th className="text-left py-1.5 px-2">Cliente</th>
                      <th className="text-left py-1.5 px-2">Responsável</th>
                      <th className="text-left py-1.5 px-2">Prioridade</th>
                      <th className="text-left py-1.5 px-2">Início</th>
                      <th className="py-1.5 px-2 w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map(t => (
                      <tr key={t.id}
                        className="border-b border-gray-50 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                        onClick={() => onTicketClick?.(t)}>
                        <td className="py-2 px-2 text-xs text-gray-400 font-mono">#{t.id}</td>
                        <td className="py-2 px-2 max-w-[260px]">
                          <span className="text-gray-800 font-medium truncate block">{t.subject}</span>
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[140px]">
                          {t.requester?.name || '—'}
                        </td>
                        <td className="py-2 px-2 text-xs truncate max-w-[120px]">
                          {t.responder_id
                            ? <span className="text-gray-600">{agentMap.get(t.responder_id) || '—'}</span>
                            : <span className="text-amber-500 font-medium">Sem responsável</span>
                          }
                        </td>
                        <td className={`py-2 px-2 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                          {PRIORITY_NAMES[t.priority] || '—'}
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(t.created_at)}
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
