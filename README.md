# 📅 ReservaFácil

Sistema de reserva de salas de reunião e veículos.  
**Stack:** React PWA → Supabase · Z-API (WhatsApp) · Vercel

---

## 🗂️ Estrutura do Projeto

```
reservafacil/
├── public/
│   ├── index.html          ← PWA meta tags + SW registro
│   ├── manifest.json       ← Manifesto PWA (ícone, cores, nome)
│   ├── sw.js               ← Service Worker (cache offline)
│   └── icons/              ← Adicione icon-192.png e icon-512.png
│
├── src/
│   ├── lib/
│   │   ├── supabase.js     ← Cliente Supabase (singleton)
│   │   └── whatsapp.js     ← Funções Z-API (notificações)
│   │
│   ├── hooks/
│   │   ├── useAuth.js      ← Login, logout, sessão
│   │   └── useReservas.js  ← CRUD reservas + realtime
│   │
│   ├── components/
│   │   └── Layout.js       ← Header + Bottom Nav PWA
│   │
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Inicio.js
│   │   ├── Salas.js
│   │   ├── Carro.js
│   │   ├── Historico.js
│   │   └── Admin.js
│   │
│   ├── App.js              ← Rotas + guards de autenticação
│   └── index.js
│
├── supabase_schema.sql     ← Execute no Supabase SQL Editor
├── .env.example            ← Copie para .env.local
├── vercel.json             ← Config Vercel (SPA routing)
└── package.json
```

---

## ⚙️ Passo 1 — Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Escolha nome, senha do banco, região (us-east-1 é mais rápida para BR)

### 1.2 Executar o schema
1. No painel Supabase → **SQL Editor** → **New Query**
2. Cole o conteúdo de `supabase_schema.sql` e clique **Run**
3. Isso cria: tabelas `profiles`, `salas`, `reservas` + RLS + seed de salas

### 1.3 Criar usuários de teste
1. Supabase → **Authentication** → **Users** → **Invite User**
2. Crie os usuários; após confirmar email, edite manualmente em  
   `Table Editor → profiles` o campo `papel` para `admin`
3. Adicione o campo `telefone` no formato `5514999887766` para WhatsApp

### 1.4 Copiar as keys
1. Supabase → **Settings** → **API**
2. Copie `Project URL` e `anon public key`

---

## 📱 Passo 2 — Z-API (WhatsApp)

1. Acesse [app.z-api.io](https://app.z-api.io) → crie uma conta gratuita
2. Crie uma **instância** → escaneie o QR Code com seu WhatsApp
3. Copie o **Instance ID** e o **Token**
4. Certifique-se que o número conectado está no formato `5514999887766`

> **Dica:** Para produção, considere Z-API pago ou a API oficial  
> do WhatsApp Business (Meta) para maior confiabilidade.

---

## 🔑 Passo 3 — Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com seus valores reais
nano .env.local
```

```env
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...
REACT_APP_ZAPI_INSTANCE=SUA_INSTANCE_ID
REACT_APP_ZAPI_TOKEN=SEU_TOKEN
REACT_APP_ZAPI_SENDER=5514999887766
```

---

## 🚀 Passo 4 — Executar localmente

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm start
# → http://localhost:3000
```

---

## ☁️ Passo 5 — Deploy na Vercel

### Via Vercel CLI (recomendado)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub (automático)
1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **Import Project** → escolha o repo
3. Em **Environment Variables**, adicione as 5 variáveis do `.env.local`
4. Clique **Deploy** — a Vercel detecta automaticamente o Create React App

> Cada `git push` faz deploy automático. ✨

---

## 📲 Passo 6 — Instalar como PWA

Após o deploy, no celular:

**Android (Chrome):**  
Menu → "Adicionar à tela inicial"

**iPhone (Safari):**  
Botão compartilhar → "Adicionar à Tela de Início"

O app abre sem barra de navegador, igual a um app nativo.

---

## 🔔 Como funcionam as notificações WhatsApp

| Evento | Quem recebe |
|--------|-------------|
| Nova reserva confirmada | Usuário que reservou |
| Nova reserva pendente | Todos os admins |
| Reserva cancelada | Dono da reserva |
| Aprovação/recusa pelo admin | Dono da reserva |

> Pré-requisito: campo `telefone` preenchido no perfil do usuário.

---

## 📱 Passo 7 — Migração para React Native (Expo)

Quando quiser publicar nas lojas:

```bash
# Criar projeto Expo
npx create-expo-app reservafacil-mobile --template blank

# Instalar dependências
cd reservafacil-mobile
npx expo install @supabase/supabase-js
npx expo install expo-router
```

**O que é reaproveitado:**
- ✅ `src/lib/supabase.js` — copia direto
- ✅ `src/lib/whatsapp.js` — copia direto
- ✅ `src/hooks/useAuth.js` — copia direto (pequenos ajustes)
- ✅ `src/hooks/useReservas.js` — copia direto
- 🔄 `src/pages/*.js` — adaptar `div` → `View`, `p` → `Text`, etc.
- 🔄 `src/components/Layout.js` — usar `expo-router` tabs

> Toda a lógica de negócio (hooks + lib) é 100% reutilizável.

---

## 🛣️ Próximos Passos Sugeridos

- [ ] Upload de foto de perfil (Supabase Storage)
- [ ] Recorrência de reservas (reunião semanal)
- [ ] Calendário visual semanal/mensal
- [ ] Notificação push (Expo Notifications)
- [ ] Relatório PDF mensal para admin
- [ ] Integração com Google Calendar
