import { useState } from 'react';
import { fetchTimeAudit } from '../api/freshdesk';
import { ticketUrl } from '../utils/helpers';

function fmtDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function ConvDetail({ ticketId, details, agentMap }) {
  if (!details) return (
    <p className="text-xs text-gray-400 italic py-2">Sem detalhes de conversas disponíveis.</p>
  );

  const { convs, timeDays } = details;

  return (
    <table className="w-full text-xs mt-1">
      <thead>
        <tr className="text-gray-400 uppercase border-b border-gray-200">
          <th className="text-left py-1.5 px-2">Data</th>
          <th className="text-left py-1.5 px-2">Agente</th>
          <th className="text-left py-1.5 px-2">Interação</th>
          <th className="text-left py-1.5 px-2 whitespace-nowrap">Horas lançadas?</th>
        </tr>
      </thead>
      <tbody>
        {convs.map((c, i) => {
          const hasHours = !!timeDays[c.dateStr];
          return (
            <tr key={i} className={`border-b border-gray-100 ${hasHours ? '' : 'bg-red-50/40'}`}>
              <td className="py-1.5 px-2 whitespace-nowrap font-medium text-gray-600">
                {fmtDate(c.dateStr)}
              </td>
              <td className="py-1.5 px-2 whitespace-nowrap text-gray-600">
                {agentMap.get(c.agentId) || (c.agentId ? `Agente ${c.agentId}` : '—')}
              </td>
              <td className="py-1.5 px-2 text-gray-500 max-w-[340px]">
                <span className="truncate block">{c.snippet}</span>
              </td>
              <td className="py-1.5 px-2 whitespace-nowrap">
                {hasHours
                  ? <span className="text-green-600 font-semibold">✅ Sim</span>
                  : <span className="text-red-500 font-semibold">❌ Não</span>
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function TimeAuditModal({ domain, apiKey, agents, onClose }) {
  const today        = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [startDate,   setStartDate]   = useState(firstOfMonth);
  const [endDate,     setEndDate]     = useState(today);
  const [loading,     setLoading]     = useState(false);
  const [progress,    setProgress]    = useState('');
  const [results,     setResults]     = useState(null);   // { missing, ticketDetails }
  const [expandedIds, setExpandedIds] = useState(new Set());

  const agentMap = new Map(agents.map(a => [a.id, a.contact?.name || `Agente ${a.id}`]));

  const run = async () => {
    setLoading(true);
    setResults(null);
    setExpandedIds(new Set());
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

  const toggleExpand = (ticketId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(ticketId) ? next.delete(ticketId) : next.add(ticketId);
      return next;
    });
  };

  // Agrupar missing por ticket (um ticket pode ter vários dias faltando)
  const grouped = results ? (() => {
    const map = {};
    for (const r of results.missing) {
      if (!map[r.ticket.id]) map[r.ticket.id] = { ticket: r.ticket, days: [] };
      map[r.ticket.id].days.push(r.day);
    }
    return Object.values(map).sort((a, b) => b.days.length - a.days.length);
  })() : [];

  const totalMissing = results?.missing.length ?? 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col mb-10" style={{ maxHeight: '88vh' }}>

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
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <button onClick={run} disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-1.5 rounded-lg transition-colors">
            {loading ? 'Rastreando…' : 'Rastrear'}
          </button>
          {results && !loading && (
            <span className={`text-sm font-medium ${totalMissing === 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {totalMissing === 0
                ? '✅ Nenhuma lacuna encontrada'
                : `⚠️ ${grouped.length} ticket${grouped.length > 1 ? 's' : ''} · ${totalMissing} dia${totalMissing > 1 ? 's' : ''} sem horas`}
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
                Tickets com resposta/nota de agente no período sem horas registradas naquele dia.
              </p>
            </div>
          )}

          {!loading && results !== null && totalMissing === 0 && (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-base font-semibold text-green-600">Tudo certo!</p>
              <p className="text-sm text-gray-400 mt-1">Todos os tickets com interações têm horas registradas.</p>
            </div>
          )}

          {!loading && grouped.length > 0 && (
            <div className="space-y-1">
              {grouped.map(({ ticket, days }) => {
                const isOpen    = expandedIds.has(ticket.id);
                const detail    = results.ticketDetails[ticket.id];
                return (
                  <div key={ticket.id} className="border border-gray-100 rounded-lg overflow-hidden">

                    {/* linha principal — clicável */}
                    <button
                      onClick={() => toggleExpand(ticket.id)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-amber-50/50 transition-colors"
                    >
                      {/* seta */}
                      <span className={`text-gray-400 text-xs transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`}>▶</span>

                      {/* ticket # */}
                      <span className="text-xs font-mono text-gray-400 shrink-0 w-14">#{ticket.id}</span>

                      {/* assunto */}
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">{ticket.subject}</span>

                      {/* cliente */}
                      <span className="text-xs text-gray-400 truncate max-w-[140px] hidden sm:block">
                        {ticket.requester?.name || '—'}
                      </span>

                      {/* badge dias faltando */}
                      <span className="shrink-0 text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-2">
                        {days.length} dia{days.length > 1 ? 's' : ''} sem horas
                      </span>
                    </button>

                    {/* detalhe expansível */}
                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Interações no período
                        </p>
                        <ConvDetail
                          ticketId={ticket.id}
                          details={detail}
                          agentMap={agentMap}
                        />
                        <div className="mt-3">
                          <a href={ticketUrl(domain, ticket.id)} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline">
                            Abrir ticket no FreshDesk →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
