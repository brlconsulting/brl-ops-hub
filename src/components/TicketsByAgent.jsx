import { useState } from 'react';
import { groupByAgent } from '../utils/helpers';
import GroupCard from './GroupCard';

function FilterChip({ active, onToggle, label, activeColor }) {
  return (
    <button
      onClick={onToggle}
      title={active ? `Clique para mostrar "${label}"` : `Clique para ocultar "${label}"`}
      className={`
        inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
        transition-all duration-150 select-none
        ${active
          ? `${activeColor} shadow-sm`
          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600'}
      `}
    >
      {/* eye icon: open = showing, slashed = hidden */}
      {active ? (
        /* eye-slash: actively filtering OUT */
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
               a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
               M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
               M3 3l3.6 3.6m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
               a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        /* eye-open: showing everything */
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
               -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
      {label}
    </button>
  );
}

export default function TicketsByAgent({ tickets, agents, domain, onTicketClick }) {
  // status 3 = Ag. Resposta  |  status 6 = Ag. Cliente
  // ambos significam "aguardando ação do cliente" — um único toggle
  const [hideAgCliente, setHideAgCliente] = useState(true);

  const visible = tickets.filter(t => {
    if (hideAgCliente && (t.status === 3 || t.status === 6)) return false;
    return true;
  });

  const groups    = groupByAgent(visible, agents);
  const totalAll  = tickets.filter(t => t.responder_id).length;
  const totalVis  = visible.filter(t => t.responder_id).length;
  const hidden    = totalAll - totalVis;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      {/* header row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-700 flex items-center gap-2 mr-1">
          <span>👷</span> Tickets por Agente
        </h2>

        {/* ticket count */}
        <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {totalVis} tickets
          {hidden > 0 && (
            <span className="text-gray-400 ml-1">({hidden} ocultos)</span>
          )}
        </span>

        {/* filter chips — push to right on large screens */}
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <FilterChip
            active={hideAgCliente}
            onToggle={() => setHideAgCliente(v => !v)}
            label="Aguardando Cliente"
            activeColor="bg-amber-100 text-amber-700 border-amber-300"
          />
        </div>
      </div>

      {/* grid */}
      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {totalAll === 0 ? 'Nenhum ticket atribuído' : 'Todos os tickets estão ocultos pelos filtros'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} domain={domain} onTicketClick={onTicketClick} />
          ))}
        </div>
      )}

    </div>
  );
}
