import { useEffect, useState } from 'react';
import { ticketUrl, STATUS_NAMES, PRIORITY_NAMES, PRIORITY_COLORS } from '../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

async function fetchDescription(domain, apiKey, ticketId) {
  const res = await fetch(
    `https://${domain}.freshdesk.com/api/v2/tickets/${ticketId}`,
    { headers: { Authorization: `Basic ${btoa(`${apiKey}:X`)}` } }
  );
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  return data.description_text || '';
}

export default function TicketDetailDrawer({ ticket, domain, apiKey, onClose }) {
  const [description, setDescription] = useState(null);
  const [descLoading, setDescLoading] = useState(true);

  useEffect(() => {
    setDescLoading(true);
    setDescription(null);
    fetchDescription(domain, apiKey, ticket.id)
      .then(setDescription)
      .catch(() => setDescription(''))
      .finally(() => setDescLoading(false));
  }, [ticket.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* header */}
        <div className="flex items-start justify-between p-5 border-b bg-gray-50 shrink-0">
          <div className="min-w-0 pr-6">
            <span className="text-[11px] font-mono text-gray-400">#{ticket.id}</span>
            <h2 className="text-sm font-bold text-gray-800 mt-0.5 leading-snug">{ticket.subject}</h2>
          </div>
          <button onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-700 text-xl leading-none mt-0.5">
            ✕
          </button>
        </div>

        {/* meta grid */}
        <div className="p-5 border-b shrink-0 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Status</p>
            <p className="text-xs font-medium text-gray-700">
              {STATUS_NAMES[ticket.status] || `Status ${ticket.status}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Prioridade</p>
            <p className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
              {PRIORITY_NAMES[ticket.priority] || '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Contato / Empresa</p>
            <p className="text-xs font-medium text-gray-700 truncate">
              {ticket.requester?.name || ticket.requester?.email || '—'}
              {ticket.company?.name ? ` · ${ticket.company.name}` : ''}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Criado em</p>
            <p className="text-xs font-medium text-gray-700">{formatDate(ticket.created_at)}</p>
          </div>
          {ticket.due_by && (
            <div className="col-span-2">
              <p className="text-[11px] text-gray-400 mb-0.5">Prazo</p>
              <p className="text-xs font-medium text-gray-700">{formatDate(ticket.due_by)}</p>
            </div>
          )}
        </div>

        {/* description */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Descrição
          </p>
          {descLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Carregando descrição…</p>
          ) : description ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Sem descrição disponível.</p>
          )}
        </div>

        {/* footer */}
        <div className="p-4 border-t shrink-0">
          <a
            href={ticketUrl(domain, ticket.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800
                       text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Abrir no FreshDesk
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
