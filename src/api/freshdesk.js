function base(domain) {
  return `https://${domain}.freshdesk.com/api/v2`;
}

function authHeaders(apiKey) {
  return {
    Authorization: `Basic ${btoa(`${apiKey}:X`)}`,
    'Content-Type': 'application/json',
  };
}

async function apiGet(domain, apiKey, path, params = {}) {
  const url = new URL(`${base(domain)}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers: authHeaders(apiKey) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FreshDesk ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// Fetches all tickets excluding Resolved (4) and Closed (5)
export async function fetchAllOpenTickets(domain, apiKey) {
  const results = [];
  let page = 1;
  while (true) {
    const batch = await apiGet(domain, apiKey, '/tickets', {
      per_page: 100,
      page,
      include: 'requester,company',
    });
    results.push(...batch.filter((t) => t.status !== 4 && t.status !== 5));
    if (batch.length < 100) break;
    page++;
  }
  return results;
}

export async function fetchAgents(domain, apiKey) {
  const results = [];
  let page = 1;
  while (true) {
    const batch = await apiGet(domain, apiKey, '/agents', { per_page: 100, page });
    results.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return results;
}

// Busca tickets do grupo PROJETOS via search API (suporta tickets antigos)
// Exclui Resolvidos (4) e Fechados (5) e enriquece com dados do requester
export async function fetchProjectTickets(domain, apiKey, groupId) {
  const results = [];
  let page = 1;
  const query = encodeURIComponent(`"group_id:${groupId}"`);

  while (true) {
    const url = `https://${domain}.freshdesk.com/api/v2/search/tickets?query=${query}&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${btoa(`${apiKey}:X`)}` },
    });
    if (!res.ok) throw new Error(`FreshDesk search ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const batch = data.results || [];
    results.push(...batch.filter(t => t.status !== 4 && t.status !== 5));
    if (batch.length < 30 || results.length >= data.total) break;
    page++;
  }

  // search API não suporta include=requester — buscar contatos individualmente
  const uniqueIds = [...new Set(results.map(t => t.requester_id).filter(Boolean))];
  const contactMap = {};
  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        contactMap[id] = await apiGet(domain, apiKey, `/contacts/${id}`);
      } catch {
        // ignora erros individuais
      }
    })
  );

  return results.map(t => ({
    ...t,
    requester: contactMap[t.requester_id] || null,
  }));
}

// Auditoria de horas: tickets com interação de agente no período sem horas lançadas
// Retorna { missing: [...], ticketDetails: { [id]: { convs, timeDays } } }
export async function fetchTimeAudit(domain, apiKey, startDateStr, endDateStr, onProgress) {
  const start = new Date(startDateStr + 'T00:00:00');
  const end   = new Date(endDateStr   + 'T23:59:59');

  // 1. Registros de horas no período
  onProgress?.('Buscando registros de horas…');
  const allTimeEntries = [];
  let page = 1;
  while (page <= 30) {
    const batch = await apiGet(domain, apiKey, '/time_entries', { per_page: 100, page });
    if (!batch.length) break;
    for (const e of batch) {
      if (!e.executed_at) continue;
      const d = new Date(e.executed_at.split('T')[0] + 'T12:00:00');
      if (d >= start && d <= end) allTimeEntries.push(e);
    }
    if (batch.length < 100) break;
    page++;
  }
  // timeMap[ticketId][dateStr] = true
  const timeMap = {};
  for (const e of allTimeEntries) {
    const dateStr = e.executed_at.split('T')[0];
    if (!timeMap[e.ticket_id]) timeMap[e.ticket_id] = {};
    timeMap[e.ticket_id][dateStr] = true;
  }

  // 2. Tickets atualizados no período
  onProgress?.('Buscando tickets atualizados no período…');
  const updatedTickets = [];
  page = 1;
  while (true) {
    const batch = await apiGet(domain, apiKey, '/tickets', {
      per_page: 100,
      page,
      updated_since: startDateStr,
      include: 'requester',
    });
    for (const t of batch) {
      if (new Date(t.updated_at) <= end) updatedTickets.push(t);
    }
    if (batch.length < 100) break;
    page++;
  }

  // 3. Conversas por ticket em lotes de 5
  const missing = [];
  const ticketDetails = {}; // { [ticketId]: { convs: [...], timeDays: {...} } }
  const BATCH = 5;

  for (let i = 0; i < updatedTickets.length; i += BATCH) {
    onProgress?.(`Verificando conversas: ${Math.min(i + BATCH, updatedTickets.length)} / ${updatedTickets.length} tickets…`);
    const slice = updatedTickets.slice(i, i + BATCH);
    await Promise.all(slice.map(async ticket => {
      try {
        const convs = await apiGet(domain, apiKey, `/tickets/${ticket.id}/conversations`, { per_page: 100 });
        const agentConvs = [];
        const agentDays  = {}; // dateStr → agentId (para detectar lacunas)

        for (const c of convs) {
          if (c.incoming) continue; // ignora mensagens do cliente
          const d = new Date(c.created_at);
          if (d < start || d > end) continue;
          const dateStr = c.created_at.split('T')[0];
          agentDays[dateStr] = c.user_id;
          agentConvs.push({
            dateStr,
            agentId: c.user_id,
            snippet: (c.body_text || '').replace(/\s+/g, ' ').trim().slice(0, 140) || '(sem texto)',
          });
        }

        if (agentConvs.length > 0) {
          ticketDetails[ticket.id] = {
            convs:    agentConvs.sort((a, b) => a.dateStr.localeCompare(b.dateStr)),
            timeDays: timeMap[ticket.id] || {},
          };
        }

        for (const [day, agentId] of Object.entries(agentDays)) {
          if (!timeMap[ticket.id]?.[day]) {
            missing.push({ ticket, day, agentId });
          }
        }
      } catch { /* ignora erros individuais */ }
    }));
  }

  return {
    missing: missing.sort((a, b) => b.day.localeCompare(a.day)),
    ticketDetails,
  };
}

// Retorna { year, month } do mês a exibir:
// até dia 10 → mês anterior; após dia 10 → mês atual
export function getDisplayMonth() {
  const now = new Date();
  if (now.getDate() <= 10) {
    // mês anterior (getMonth() 0-indexed atual = mês anterior 1-indexed)
    if (now.getMonth() === 0) return { year: now.getFullYear() - 1, month: 12 };
    return { year: now.getFullYear(), month: now.getMonth() }; // 1-indexed prev
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 }; // 1-indexed current
}

// Busca horas do mês de exibição (anterior ou atual conforme getDisplayMonth)
// FreshDesk não suporta filtro por data em /time_entries — filtramos no cliente
export async function fetchMonthlyTimeEntries(domain, apiKey) {
  const { year: targetYear, month: targetMonth } = getDisplayMonth();

  const results = [];
  let page = 1;

  while (page <= 30) { // limite de segurança: 3000 entradas
    const batch = await apiGet(domain, apiKey, '/time_entries', {
      per_page: 100,
      page,
    });

    if (batch.length === 0) break;

    for (const e of batch) {
      if (!e.executed_at) continue;
      const [y, m] = e.executed_at.split('T')[0].split('-').map(Number);
      if (y === targetYear && m === targetMonth) results.push(e);
    }

    if (batch.length < 100) break;
    page++;
  }

  return results;
}

// Retorna tickets criados nos últimos `days` dias que não têm nenhuma hora registrada
export async function fetchTicketsWithoutTime(domain, apiKey, tickets, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = tickets.filter(t => new Date(t.created_at) >= cutoff);
  if (recent.length === 0) return [];

  const results = await Promise.all(
    recent.map(async (t) => {
      try {
        const entries = await apiGet(domain, apiKey, `/tickets/${t.id}/time_entries`);
        return entries.length === 0 ? t : null;
      } catch {
        return null; // ignora erros individuais
      }
    })
  );

  return results.filter(Boolean);
}
