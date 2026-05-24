import { getUnassigned, getSLAViolated, STATUS_NAMES } from '../utils/helpers';

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${color} p-4 flex items-center gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

export default function SummaryBar({ tickets }) {
  const unassigned = getUnassigned(tickets).length;
  const slaViolated = getSLAViolated(tickets).length;

  const byStatus = {};
  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total de Tickets" value={tickets.length} color="border-blue-500" icon="🎫" />
      <StatCard label="Sem Agente" value={unassigned} color="border-amber-400" icon="👤" />
      <StatCard label="SLA Violado" value={slaViolated} color="border-red-500" icon="🚨" />
      <StatCard
        label="Abertos / Pendentes"
        value={`${byStatus[2] || 0} / ${byStatus[3] || 0}`}
        color="border-purple-400"
        icon="📋"
      />
    </div>
  );
}
