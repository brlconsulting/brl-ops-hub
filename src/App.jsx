import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChartsSection from './components/ChartsSection';
import TicketsByAgent from './components/TicketsByAgent';
import TicketsByCustomer from './components/TicketsByCustomer';
import UnassignedPanel from './components/UnassignedPanel';
import SLAPanel from './components/SLAPanel';
import UrgentPanel from './components/UrgentPanel';
import ProjectsPanel from './components/ProjectsPanel';
import ThomsonPanel from './components/ThomsonPanel';
import NoTimePanel from './components/NoTimePanel';
import ScheduledPanel from './components/ScheduledPanel';
import TimeMatrixPanel from './components/TimeMatrixPanel';
import OpenByCustomerPanel from './components/OpenByCustomerPanel';
import SettingsModal from './components/SettingsModal';
import TimeAuditModal from './components/TimeAuditModal';
import TicketDetailDrawer from './components/TicketDetailDrawer';
import { fetchAllOpenTickets, fetchAgents, fetchProjectTickets, fetchTicketsWithoutTime, fetchMonthlyTimeEntries } from './api/freshdesk';

const PROJETOS_GROUP_ID = 22000159334;

const REFRESH_MS = 5 * 60 * 1000;

export default function App() {
  const [config, setConfig] = useState({
    domain: localStorage.getItem('fd_domain') || 'brl',
    apiKey: localStorage.getItem('fd_apikey') || 'pwvFRPDL22HndR45C0AV',
  });
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [projectTickets, setProjectTickets] = useState([]);
  const [noTimeTickets, setNoTimeTickets] = useState([]);
  const [noTimeLoading, setNoTimeLoading] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [timeMatrixLoading, setTimeMatrixLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSettings,    setShowSettings]    = useState(false);
  const [showAudit,       setShowAudit]       = useState(false);
  const [selectedTicket,  setSelectedTicket]  = useState(null);

  const refresh = useCallback(async () => {
    if (!config.apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const [t, a, p] = await Promise.all([
        fetchAllOpenTickets(config.domain, config.apiKey),
        fetchAgents(config.domain, config.apiKey),
        fetchProjectTickets(config.domain, config.apiKey, PROJETOS_GROUP_ID),
      ]);
      setTickets(t);
      setAgents(a);
      setProjectTickets(p);
      setLastUpdated(new Date());

      // Busca em segundo plano: tickets sem horas + matriz mensal (não bloqueiam o dashboard)
      setNoTimeLoading(true);
      fetchTicketsWithoutTime(config.domain, config.apiKey, t)
        .then(nt => setNoTimeTickets(nt))
        .catch(() => {})
        .finally(() => setNoTimeLoading(false));

      setTimeMatrixLoading(true);
      fetchMonthlyTimeEntries(config.domain, config.apiKey)
        .then(te => setTimeEntries(te))
        .catch(err => console.error('fetchMonthlyTimeEntries:', err))
        .finally(() => setTimeMatrixLoading(false));

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const saveConfig = (cfg) => {
    localStorage.setItem('fd_domain', cfg.domain);
    localStorage.setItem('fd_apikey', cfg.apiKey);
    setConfig(cfg);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        onAudit={() => setShowAudit(true)}
        onSettings={() => setShowSettings(true)}
      />

      {showAudit && (
        <TimeAuditModal
          domain={config.domain}
          apiKey={config.apiKey}
          agents={agents}
          onClose={() => setShowAudit(false)}
        />
      )}

      {selectedTicket && (
        <TicketDetailDrawer
          ticket={selectedTicket}
          domain={config.domain}
          apiKey={config.apiKey}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          config={config}
          onSave={saveConfig}
          onClose={() => config.apiKey && setShowSettings(false)}
        />
      )}

      {error && (
        <div className="max-w-screen-2xl mx-auto px-4 pt-3">
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <span className="text-lg shrink-0">⚠️</span>
            <div>
              <strong>Erro ao conectar ao FreshDesk:</strong> {error}
              <button onClick={() => setShowSettings(true)} className="ml-2 underline hover:text-red-800">
                Verificar configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {(
        <main className="max-w-screen-2xl mx-auto px-4 py-5 space-y-5">

          {/* 1 — Visão geral: mini-stats + 3 donuts */}
          <ChartsSection tickets={tickets} agents={agents} />

          {/* 2 — SLA violado | Urgentes + Thomson (empilhados) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SLAPanel tickets={tickets} domain={config.domain} onTicketClick={setSelectedTicket} />
            <div className="flex flex-col gap-5">
              <UrgentPanel tickets={tickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />
              <ThomsonPanel tickets={tickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />
            </div>
          </div>

          {/* 3 — Sem Horas Registradas */}
          <NoTimePanel tickets={noTimeTickets} loading={noTimeLoading} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 4 — Sem agente (faixa completa) */}
          <UnassignedPanel tickets={tickets} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 5 — Tickets por Agente */}
          <TicketsByAgent tickets={tickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 6 — Tickets por Cliente */}
          <TicketsByCustomer tickets={tickets} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 7 — Projetos */}
          <ProjectsPanel tickets={projectTickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 8 — Atividade Agendada */}
          <ScheduledPanel tickets={tickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 9 — Tickets abertos por cliente (tabela) */}
          <OpenByCustomerPanel tickets={tickets} agents={agents} domain={config.domain} onTicketClick={setSelectedTicket} />

          {/* 10 — Horas por Consultor */}
          <TimeMatrixPanel timeEntries={timeEntries} agents={agents} loading={timeMatrixLoading} tickets={[...tickets, ...projectTickets]} />

        </main>
      )}
    </div>
  );
}
