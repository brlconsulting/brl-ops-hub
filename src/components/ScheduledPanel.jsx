import { ticketUrl, PRIORITY_COLORS, PRIORITY_NAMES, dueDateLabel } from '../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export default function ScheduledPanel({ tickets, agents, domain, onTicketClick }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  const items = tickets
    .filter(t => t.status === 8)
    .sort((a, b) => new Date(a.due_by || a.created_at) - new Date(b.due_by || b.created_at));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>📅</span> Atividade Agendada
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
          ${items.length === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {items.length} {items.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📆</p>
          <p className="text-sm">Nenhuma atividade agendada no momento</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase border-b">
              <tr>
                <th className="text-left py-1.5 px-2">#</th>
                <th className="text-left py-1.5 px-2">Assunto</th>
                <th className="text-left py-1.5 px-2">Cliente</th>
                <th className="text-left py-1.5 px-2">Agente</th>
                <th className="text-left py-1.5 px-2">Prioridade</th>
                <th className="text-left py-1.5 px-2">Prazo</th>
                <th className="text-left py-1.5 px-2">Criado</th>
                <th className="py-1.5 px-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => {
                const due = dueDateLabel(t.due_by);
                const isOverdue = t.due_by && new Date(t.due_by) < new Date();
                return (
                  <tr key={t.id}
                    className={`border-b border-gray-50 hover:bg-orange-50/40 transition-colors cursor-pointer ${isOverdue ? 'bg-red-50/30' : ''}`}
                    onClick={() => onTicketClick?.(t)}>
                    <td className="py-2 px-2 text-xs text-gray-400 font-mono">#{t.id}</td>
                    <td className="py-2 px-2 max-w-[280px]">
                      <span className="text-gray-800 font-medium truncate block">{t.subject}</span>
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[140px]">
                      {t.requester?.name || '—'}
                    </td>
                    <td className="py-2 px-2 text-xs truncate max-w-[120px]">
                      {t.responder_id
                        ? <span className="text-gray-600">{agentMap.get(t.responder_id) || '—'}</span>
                        : <span className="text-amber-500 font-medium">Sem agente</span>
                      }
                    </td>
                    <td className={`py-2 px-2 text-xs ${PRIORITY_COLORS[t.priority]}`}>
                      {PRIORITY_NAMES[t.priority] || '—'}
                    </td>
                    <td className={`py-2 px-2 text-xs whitespace-nowrap ${due.cls}`}>
                      {due.text}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="py-2 px-2 text-right">
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
