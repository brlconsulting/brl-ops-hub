import { ticketUrl, PRIORITY_COLORS, PRIORITY_NAMES } from '../utils/helpers';

export default function ThomsonPanel({ tickets, agents, domain }) {
  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  const items = tickets
    .filter(t => t.status === 7)
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at)); // mais antigos primeiro

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>⏳</span> Aguardando Thomson
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
          ${items.length === 0 ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
          {items.length}
        </span>
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-6">Nenhum ticket aguardando Thomson</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b sticky top-0 bg-white">
              <tr>
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Assunto</th>
                <th className="text-left py-2 px-1">Cliente</th>
                <th className="text-left py-2 px-1">Agente</th>
                <th className="text-left py-2 px-1">Prior.</th>
                <th className="text-left py-2 px-1">Esperando</th>
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
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-teal-50/40 transition-colors">
                    <td className="py-1.5 px-1 text-gray-400 text-xs font-mono">
                      <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                        className="hover:text-blue-600">#{t.id}</a>
                    </td>
                    <td className="py-1.5 px-1 max-w-[180px]">
                      <a href={ticketUrl(domain, t.id)} target="_blank" rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-blue-600 truncate block">
                        {t.subject}
                      </a>
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
