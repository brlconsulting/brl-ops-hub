import { useState } from 'react';
import { fetchTimeAudit } from '../api/freshdesk';
import { ticketUrl } from '../utils/helpers';

function fmtDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

export default function TimeAuditModal({ domain, apiKey, agents, onClose }) {
  const today        = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate,   setEndDate]   = useState(today);
  const [loading,   setLoading]   = useState(false);
  const [progress,  setProgress]  = useState('');
  const [results,   setResults]   = useState(null);

  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  const run = async () => {
    setLoading(true);
    setResults(null);
    setProgress('Iniciando…');
    try {
      const data = await fetchTimeAudit(domain, apiKey, startDate, endDate, setProgress);
      setResults(data);
    } catch (e) {
      setProgress('Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Rastrear Horas Não Lançadas
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* controls */}
        <div className="p-5 border-b shrink-0 flex flex-wrap items-end gap-4 bg-gray-50">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data início</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
          </div>
          <button onClick={run} disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-1.5 rounded-lg transition-colors">
            {loading ? 'Rastreando…' : 'Rastrear'}
          </button>
          {results && !loading && (
            <span className={`text-sm font-medium ${results.length === 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {results.length === 0
                ? '✅ Nenhuma lacuna encontrada'
                : `⚠️ ${results.length} ocorrência${results.length > 1 ? 's' : ''} sem horas`}
            </span>
          )}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="text-center py-16">
              <div className="text-3xl mb-4 animate-spin inline-block">⏳</div>
              <p className="text-sm text-gray-500">{progress}</p>
            </div>
          )}

          {!loading && results === null && (
            <div className="text-center py-14 text-gray-400">
              <p className="text-3xl mb-3">🔎</p>
              <p className="text-sm">Selecione o período e clique em <strong>Rastrear</strong>.</p>
              <p className="text-xs mt-2 text-gray-300">
                O sistema verifica todos os tickets que tiveram interação de agente no período
                e não possuem horas registradas naquele dia.
              </p>
            </div>
          )}

          {!loading && results?.length === 0 && (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-base font-semibold text-green-600">Tudo certo!</p>
              <p className="text-sm text-gray-400 mt-1">
                Todos os tickets com interações possuem horas registradas no período.
              </p>
            </div>
          )}

          {!loading && results?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase border-b sticky top-0 bg-white">
                  <tr>
                    <th className="text-left py-2 px-2">Data</th>
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Assunto</th>
                    <th className="text-left py-2 px-2">Cliente</th>
                    <th className="text-left py-2 px-2">Agente</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-amber-50/40 transition-colors">
                      <td className="py-2 px-2 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {fmtDate(r.day)}
                      </td>
                      <td className="py-2 px-2">
                        <a href={ticketUrl(domain, r.ticket.id)} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-gray-400 font-mono hover:text-blue-600">
                          #{r.ticket.id}
                        </a>
                      </td>
                      <td className="py-2 px-2 max-w-[280px]">
                        <a href={ticketUrl(domain, r.ticket.id)} target="_blank" rel="noopener noreferrer"
                          className="text-gray-800 font-medium hover:text-blue-600 truncate block">
                          {r.ticket.subject}
                        </a>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[130px]">
                        {r.ticket.requester?.name || '—'}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600 truncate max-w-[130px]">
                        {agentMap.get(r.agentId) || (r.agentId ? `Agente ${r.agentId}` : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
