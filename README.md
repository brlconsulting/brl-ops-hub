# BRL Ops Hub

**BRL Consultores — Gestão Operacional** | Dashboard de tickets FreshDesk em tempo real.

## Funcionalidades

- **Tickets por Agente** — cards com lista de tickets e totalizador colorido por volume
- **Tickets por Cliente** — cards com lista de tickets e totalizador colorido por volume
- **Tickets sem Agente** — painel com tickets não atribuídos
- **SLA Violado** — lista de tickets com prazo vencido, ordenados por mais atrasado
- **Totalizadores** — barras de volume por status, agente (top 10) e cliente (top 10)
- **Auto-refresh** a cada 5 minutos
- Escala de cores: 🟢 1-3 | 🟡 4-7 | 🟠 8-12 | 🔴 13+ tickets

## Escala de Cores

| Volume | Cor |
|--------|-----|
| 1–3 tickets | Verde |
| 4–7 tickets | Amarelo |
| 8–12 tickets | Laranja |
| 13+ tickets | Vermelho |

## Configuração

A chave de API é salva **somente no seu navegador** (localStorage) — nunca no repositório.

1. Abra o app
2. Clique em ⚙️ (configurações)
3. Informe o domínio FreshDesk (ex: `brl`) e sua chave de API
4. Clique em **Salvar e Conectar**

## Deploy no GitHub Pages

### 1. Criar o repositório

```bash
git init
git add .
git commit -m "feat: initial BRL Ops Hub"
gh repo create brl-ops-hub --public --push --source .
```

### 2. Ativar GitHub Pages

No GitHub: **Settings → Pages → Source → GitHub Actions**

O deploy ocorre automaticamente a cada push na branch `main`.

### 3. URL final

```
https://<seu-usuario>.github.io/brl-ops-hub/
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3
- FreshDesk API v2
