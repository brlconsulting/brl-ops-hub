import { useState } from 'react';

export default function SettingsModal({ config, onSave, onClose }) {
  const [domain, setDomain] = useState(config.domain || 'brl');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!domain.trim() || !apiKey.trim()) return;
    onSave({ domain: domain.trim(), apiKey: apiKey.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Configurações FreshDesk</h2>
          {config.apiKey && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domínio FreshDesk
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="brl"
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <span className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-l">.freshdesk.com</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave de API
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Sua chave de API do FreshDesk"
                className="flex-1 px-3 py-2 text-sm outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 border-l bg-gray-50"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              A chave é salva apenas no seu navegador (localStorage).
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!domain.trim() || !apiKey.trim()}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Salvar e Conectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
