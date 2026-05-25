import { ticketUrl, STATUS_NAMES } from '../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function NoTimePanel({ tickets, loading, domain }) {
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
                <th className="text-left py-2 px-1">Cliente</th>
                <th className="text-left py-2 px-1">Status</th>
                <th className="text-left py-2 px-1">Criado</th>
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
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors">
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
                    <td className="py-1.5 px-1 text-xs text-gray-500 whitespace-nowrap">
                      {STATUS_NAMES[t.status] || `Status ${t.status}`}
                    </td>
                    <td className={`py-1.5 px-1 text-xs whitespace-nowrap ${ageCls}`}>
                      {formatDate(t.created_at)}
                      {ageDays > 0 && (
                        <span className="ml-1 text-gray-400 font-normal">({ageDays}d)</span>
                      )}
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
