import { ticketUrl, STATUS_NAMES } from '../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

export default function NoTimePanel({ tickets, loading, agents = [], domain, onTicketClick }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>⏱️</span> Sem Horas Registradas
        <span className="text-xs font-normal text-gray-400 ml-0.5">(30 dias)</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
          ${loading
            ? 'bg-gray-100 text-gray-400'
            : tickets.length === 0
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
          {loading ? '…' : tickets.length}
        </span>
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6 animate-pulse">
          Verificando horas registradas…
        </p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-6">
          Todos os tickets têm horas registradas
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b sticky top-0 bg-white">
              <tr>
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Assunto</th>
                <th className="text-left py-2 px-1">Agente</th>
                <th className="text-left py-2 px-1">Status</th>
                <th className="text-left py-2 px-1">Criado</th>
                <th className="py-2 px-1 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => {
                const ageDays = Math.floor((Date.now() - new Date(t.created_at)) / 86_400_000);
                const ageCls = ageDays >= 14
                  ? 'text-red-500 font-semibold'
                  : ageDays >= 7
                    ? 'text-orange-500'
                    : 'text-gray-500';
                return (
                  <tr key={t.id}
                    className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors cursor-pointer"
                    onClick={() => onTicketClick?.(t)}>
                    <td className="py-1.5 px-1 text-gray-400 text-xs font-mono">#{t.id}</td>
                    <td className="py-1.5 px-1 max-w-[180px]">
                      <span className="text-gray-800 font-medium truncate block">{t.subject}</span>
                    </td>
                    <td className="py-1.5 px-1 text-xs truncate max-w-[110px]">
                      {t.responder_id
                        ? <span className="text-gray-600">{agentMap.get(t.responder_id) || '—'}</span>
                        : <span className="text-amber-500 font-medium">Sem agente</span>
                      }
                    </td>
                    <td className="py-1.5 px-1 text-xs text-gray-500 whitespace-nowrap">
                      {STATUS_NAMES[t.status] || `Status ${t.status}`}
                    </td>
                    <td className={`py-1.5 px-1 text-xs whitespace-nowrap ${ageCls}`}>
                      {formatDate(t.created_at)}
                      {ageDays > 0 && (
                        <span className="ml-1 text-gray-400 font-normal">({ageDays}d)</span>
                      )}
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
