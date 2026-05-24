import DonutChart from './DonutChart';
import { groupByAgent, groupByCustomer, getSLAViolated, getUnassigned } from '../utils/helpers';

const STATUS_COLORS = {
  2:  '#3b82f6',  // blue       — Em Análise
  3:  '#8b5cf6',  // violet     — Ag. Resposta
  6:  '#f59e0b',  // amber      — Ag. Cliente
  7:  '#14b8a6',  // teal       — Ag. Thomson
  8:  '#f97316',  // orange     — Ativ. Agendada
  9:  '#06b6d4',  // cyan       — Em Desenvolvimento
  10: '#6366f1',  // indigo     — Projeto - Andamento
  11: '#ec4899',  // pink       — Proposta
  12: '#ef4444',  // red        — Projeto - Parado
};
const STATUS_NAMES = {
  2:  'Em Análise',
  3:  'Ag. Resposta',
  6:  'Ag. Cliente',
  7:  'Ag. Thomson',
  8:  'Ativ. Agendada',
  9:  'Em Dev.',
  10: 'Proj. Andamento',
  11: 'Proposta',
  12: 'Proj. Parado',
};

const AGENT_PALETTE   = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
const CUSTOMER_PALETTE = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#f97316'];

function buildAgentData(tickets, agents) {
  const groups = groupByAgent(tickets, agents);
  const top = groups.slice(0, 6);
  const othersCount = groups.slice(6).reduce((s, g) => s + g.tickets.length, 0);
  const data = top.map((g, i) => ({
    label: g.name.split(' ')[0],
    value: g.tickets.length,
    color: AGENT_PALETTE[i] || '#6b7280',
  }));
  if (othersCount > 0) data.push({ label: 'Outros', value: othersCount, color: '#9ca3af' });
  return data;
}

function buildCustomerData(tickets) {
  const groups = groupByCustomer(tickets);
  const top = groups.slice(0, 6);
  const othersCount = groups.slice(6).reduce((s, g) => s + g.tickets.length, 0);
  const data = top.map((g, i) => ({
    label: g.name.split(' ')[0],
    value: g.tickets.length,
    color: CUSTOMER_PALETTE[i] || '#6b7280',
  }));
  if (othersCount > 0) data.push({ label: 'Outros', value: othersCount, color: '#9ca3af' });
  return data;
}

function buildStatusData(tickets) {
  const counts = {};
  for (const t of tickets) counts[t.status] = (counts[t.status] || 0) + 1;
  return Object.entries(counts).map(([status, value]) => ({
    label: STATUS_NAMES[status] || `Status ${status}`,
    value,
    color: STATUS_COLORS[status] || '#6b7280',
  }));
}

function MiniStat({ label, value, icon, cls }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${cls}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-extrabold leading-none text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ChartsSection({ tickets, agents }) {
  const sla = getSLAViolated(tickets).length;
  const unassigned = getUnassigned(tickets).length;

  const byStatus = buildStatusData(tickets);
  const byAgent  = buildAgentData(tickets, agents);
  const byCustomer = buildCustomerData(tickets);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-bold text-gray-700 mb-5 flex items-center gap-2">
        <span>📊</span> Visão Geral
      </h2>

      {/* Mini stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Total de Tickets"   value={tickets.length} icon="🎫" cls="border-blue-200 bg-blue-50" />
        <MiniStat label="Abertos"             value={tickets.filter(t=>t.status===2).length} icon="📂" cls="border-indigo-200 bg-indigo-50" />
        <MiniStat label="SLA Violado"         value={sla}           icon="🚨" cls={sla > 0 ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'} />
        <MiniStat label="Sem Agente"          value={unassigned}    icon="👤" cls={unassigned > 0 ? 'border-amber-300 bg-amber-50' : 'border-green-200 bg-green-50'} />
      </div>

      {/* Three bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-1">
        <DonutChart data={byStatus}   title="Por Status"  />
        <DonutChart data={byAgent}    title="Por Agente"  />
        <DonutChart data={byCustomer} title="Por Cliente" />
      </div>
    </div>
  );
}
