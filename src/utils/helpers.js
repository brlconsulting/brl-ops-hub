export const STATUS_NAMES = {
  2:  'Em Análise',
  3:  'Ag. Resposta',
  6:  'Ag. Cliente',
  7:  'Ag. Thomson',
  8:  'Ativ. Agendada',
  9:  'Em Desenvolvimento',
  10: 'Projeto - Andamento',
  11: 'Proposta',
  12: 'Projeto - Parado',
};

export const PRIORITY_NAMES = { 1: 'Baixa', 2: 'Média', 3: 'Alta', 4: 'Urgente' };

export const PRIORITY_COLORS = {
  1: 'text-gray-400',
  2: 'text-blue-500',
  3: 'text-orange-500',
  4: 'text-red-600 font-bold',
};

// Color scale based on ticket volume
export function volumeColor(count) {
  if (count <= 3)  return { border: 'border-green-300',  badge: 'bg-green-100 text-green-800',  header: 'bg-green-50'  };
  if (count <= 7)  return { border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800', header: 'bg-yellow-50' };
  if (count <= 12) return { border: 'border-orange-300', badge: 'bg-orange-100 text-orange-800', header: 'bg-orange-50' };
  return             { border: 'border-red-400',    badge: 'bg-red-100 text-red-800',    header: 'bg-red-50'    };
}

export function groupByAgent(tickets, agents) {
  const nameMap = new Map(agents.map((a) => [a.id, a.contact?.name || `Agente ${a.id}`]));
  const groups = {};
  for (const t of tickets) {
    if (!t.responder_id) continue;
    const id = t.responder_id;
    if (!groups[id]) groups[id] = { id, name: nameMap.get(id) || `Agente ${id}`, tickets: [] };
    groups[id].tickets.push(t);
  }
  return Object.values(groups).sort((a, b) => b.tickets.length - a.tickets.length);
}

export function groupByCustomer(tickets) {
  const groups = {};
  for (const t of tickets) {
    const id = t.requester_id;
    const name = t.requester?.name || t.requester?.email || `Cliente ${id}`;
    if (!groups[id]) groups[id] = { id, name, tickets: [] };
    groups[id].tickets.push(t);
  }
  return Object.values(groups).sort((a, b) => b.tickets.length - a.tickets.length);
}

export function getUnassigned(tickets) {
  return tickets.filter((t) => !t.responder_id);
}

export function getSLAViolated(tickets) {
  const now = new Date();
  return tickets.filter((t) => t.due_by && new Date(t.due_by) < now);
}

export function dueDateLabel(dateStr) {
  if (!dateStr) return { text: '—', cls: 'text-gray-400' };
  const diff = new Date(dateStr) - new Date();
  const h = Math.round(Math.abs(diff) / 3600000);
  if (diff < 0) {
    const label = h < 24 ? `${h}h em atraso` : `${Math.ceil(h / 24)}d em atraso`;
    return { text: label, cls: 'text-red-600 font-semibold' };
  }
  const label = h < 24 ? `${h}h restantes` : `${Math.ceil(h / 24)}d restantes`;
  return { text: label, cls: h < 4 ? 'text-orange-500' : 'text-green-600' };
}

export function ticketUrl(domain, id) {
  return `https://${domain}.freshdesk.com/a/tickets/${id}`;
}
