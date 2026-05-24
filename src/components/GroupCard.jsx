import { useState } from 'react';
import { volumeColor, PRIORITY_COLORS, PRIORITY_NAMES, ticketUrl } from '../utils/helpers';

function TicketRow({ ticket, domain }) {
  return (
    <a
      href={ticketUrl(domain, ticket.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-gray-400 text-xs mt-0.5 shrink-0">#{ticket.id}</span>
        <span className="text-gray-700 truncate">{ticket.subject}</span>
      </div>
      <span className={`shrink-0 text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
        {PRIORITY_NAMES[ticket.priority] || '—'}
      </span>
    </a>
  );
}

export default function GroupCard({ group, domain }) {
  const [expanded, setExpanded] = useState(false);
  const count = group.tickets.length;
  const colors = volumeColor(count);
  const visible = expanded ? group.tickets : group.tickets.slice(0, 5);

  return (
    <div className={`border rounded-lg overflow-hidden ${colors.border}`}>
      <div
        className={`flex items-center justify-between px-3 py-2 cursor-pointer ${colors.header}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-semibold text-gray-800 text-sm truncate">{group.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {count}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="bg-white px-1 py-1">
        {visible.map((t) => (
          <TicketRow key={t.id} ticket={t} domain={domain} />
        ))}
        {!expanded && count > 5 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-800 py-1.5"
          >
            Ver mais {count - 5} tickets…
          </button>
        )}
        {expanded && count > 5 && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1.5"
          >
            Recolher
          </button>
        )}
      </div>
    </div>
  );
}
