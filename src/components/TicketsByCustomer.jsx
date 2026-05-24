import { useState } from 'react';
import { groupByCustomer } from '../utils/helpers';
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
      {/* funil: ativo = filtrando, inativo = sem filtro */}
      <svg className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
      </svg>
      {label}
    </button>
  );
}

export default function TicketsByCustomer({ tickets, domain }) {
  // quando ativo: mostra SOMENTE os tickets aguardando o cliente (status 3 ou 6)
  const [soAgCliente, setSoAgCliente] = useState(false);

  const visible = soAgCliente
    ? tickets.filter(t => t.status === 3 || t.status === 6)
    : tickets;

  const groups   = groupByCustomer(visible);
  const totalAll = tickets.length;
  const soCount  = tickets.filter(t => t.status === 3 || t.status === 6).length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      {/* header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-700 flex items-center gap-2 mr-1">
          <span>🏢</span> Tickets por Cliente
        </h2>

        <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {visible.length} de {totalAll} tickets
        </span>

        <div className="ml-auto">
          <FilterChip
            active={soAgCliente}
            onToggle={() => setSoAgCliente(v => !v)}
            label={`Somente c/ Cliente${soAgCliente ? '' : ` (${soCount})`}`}
            activeColor="bg-amber-100 text-amber-700 border-amber-300"
          />
        </div>
      </div>

      {/* grid */}
      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {totalAll === 0 ? 'Sem tickets de clientes' : 'Nenhum ticket aguardando o cliente no momento'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} domain={domain} />
          ))}
        </div>
      )}

    </div>
  );
}
