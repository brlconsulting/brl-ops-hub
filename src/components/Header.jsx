export default function Header({ loading, lastUpdated, onRefresh, onSettings, onAudit }) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight">BRL Ops Hub</span>
          <span className="text-blue-300 text-sm hidden sm:block">— Gestão Operacional</span>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-blue-300 text-xs hidden md:block">
              Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}

          <button
            onClick={onAudit}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-sm transition-colors"
            title="Rastrear horas não lançadas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rastrear Horas
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-3 py-1.5 rounded text-sm transition-colors"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>

          <button
            onClick={onSettings}
            className="p-1.5 hover:bg-blue-700 rounded transition-colors"
            title="Configurações"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
