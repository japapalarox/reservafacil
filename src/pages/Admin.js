// src/pages/Admin.js
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservas, useSalas } from '../hooks/useReservas'

export default function Admin() {
  const { profile }                       = useAuth()
  const { salas }                         = useSalas()
  const { reservas, atualizarStatus, loading } = useReservas(profile)

  const stats = [
    { label: 'Total',       val: reservas.length,                                   emoji: '📅', bg: '#E1F5EE', c: '#0F6E56' },
    { label: 'Confirmadas', val: reservas.filter(r => r.status === 'confirmado').length, emoji: '✅', bg: '#EAF3DE', c: '#3B6D11' },
    { label: 'Pendentes',   val: reservas.filter(r => r.status === 'pendente').length,   emoji: '⏳', bg: '#FAEEDA', c: '#854F0B' },
    { label: 'Canceladas',  val: reservas.filter(r => r.status === 'cancelado').length,  emoji: '❌', bg: '#FCEBEB', c: '#A32D2D' },
  ]

  const pendentes = reservas.filter(r => r.status === 'pendente')

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-loading-emoji">⚙️</div>
      Carregando…
    </div>
  )

  return (
    <div className="admin-root">
      <h2 className="admin-titulo">Painel Administrativo</h2>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map(st => (
          <div key={st.label} className="admin-stat-card" style={{ background: st.bg }}>
            <div className="admin-stat-emoji">{st.emoji}</div>
            <div className="admin-stat-val" style={{ color: st.c }}>{st.val}</div>
            <div className="admin-stat-label" style={{ color: st.c }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Aprovações pendentes */}
      <div className="admin-card">
        <h3 className="admin-card-titulo">
          ⏳ Aprovações Pendentes
          {pendentes.length > 0 && (
            <span className="admin-count-badge">{pendentes.length}</span>
          )}
        </h3>
        {pendentes.length === 0
          ? <p className="admin-card-vazio">Nenhum pendente ✓</p>
          : pendentes.map(r => {
            const autor = r.autor?.nome || '—'
            const recurso = r.tipo === 'carro' ? '🚗 Gol' : `🏢 ${r.sala?.nome}`
            return (
              <div key={r.id} className="admin-pend-item">
                <div className="admin-pend-info">
                  <div className="admin-pend-nome">{autor} — {recurso}</div>
                  <div className="admin-pend-sub">
                    {r.data} · {r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)} · {r.motivo}
                  </div>
                </div>
                <div className="admin-pend-acoes">
                  <button onClick={() => atualizarStatus(r.id, 'confirmado')} className="admin-btn-aprovar">
                    ✓ Aprovar
                  </button>
                  <button onClick={() => atualizarStatus(r.id, 'cancelado')} className="admin-btn-recusar">
                    ✕ Recusar
                  </button>
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Ocupação por sala */}
      <div className="admin-card">
        <h3 className="admin-card-titulo">📊 Ocupação por Sala</h3>
        {salas.map(sala => {
          const qtd = reservas.filter(r => r.tipo === 'sala' && r.sala_id === sala.id && r.status === 'confirmado').length
          const pct = Math.min(100, qtd * 15)
          return (
            <div key={sala.id} className="admin-bar-wrap">
              <div className="admin-bar-label">
                <span>{sala.nome}</span>
                <span className="admin-bar-qtd">{qtd} reservas</span>
              </div>
              <div className="admin-bar-bg">
                <div className="admin-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .admin-root { max-width:900px; margin:0 auto; padding:24px 16px; animation:fadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .admin-loading { padding:48px; text-align:center; color:#888; animation:fadeIn 0.3s ease; }
        .admin-loading-emoji { font-size:32px; margin-bottom:10px; animation:spin 2s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .admin-titulo { font-size:22px; font-weight:800; color:#2C2C2A; margin-bottom:20px; letter-spacing:-0.3px; }
        .admin-stats-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:12px; margin-bottom:20px; }
        .admin-stat-card { border-radius:16px; padding:18px 14px; text-align:center; transition:all 0.25s cubic-bezier(0.22,1,0.36,1); cursor:default; border:1px solid rgba(0,0,0,0.04); }
        .admin-stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.08); }
        .admin-stat-emoji { font-size:28px; margin-bottom:6px; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .admin-stat-card:hover .admin-stat-emoji { transform:scale(1.2) rotate(-8deg); }
        .admin-stat-val { font-size:28px; font-weight:700; margin-bottom:2px; }
        .admin-stat-label { font-size:12px; font-weight:600; opacity:0.8; }
        .admin-card { background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); border-radius:16px; border:1px solid rgba(211,209,199,0.5); padding:22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(0,0,0,0.03); }
        .admin-card-titulo { font-size:15px; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:8px; color:#2C2C2A; }
        .admin-count-badge { background:#FAEEDA; color:#854F0B; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from{transform:scale(0);} to{transform:scale(1);} }
        .admin-card-vazio { font-size:13px; color:#888; padding:8px 0; }
        .admin-pend-item { display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid #F1EFE8; transition:all 0.2s; }
        .admin-pend-item:hover { background:rgba(255,250,247,0.5); margin:0 -14px; padding:14px; border-radius:10px; border-bottom-color:transparent; }
        .admin-pend-item:last-child { border-bottom:none; }
        .admin-pend-info { flex:1; min-width:0; }
        .admin-pend-nome { font-weight:600; font-size:14px; color:#2C2C2A; }
        .admin-pend-sub { font-size:12px; color:#888; margin-top:3px; }
        .admin-pend-acoes { display:flex; gap:8px; flex-shrink:0; }
        .admin-btn-aprovar { background:#EAF3DE; color:#3B6D11; border:none; border-radius:8px; padding:7px 14px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }
        .admin-btn-aprovar:hover { background:#3B6D11; color:#fff; transform:translateY(-2px); box-shadow:0 4px 12px rgba(59,109,17,0.3); }
        .admin-btn-aprovar:active { transform:scale(0.96); }
        .admin-btn-recusar { background:#FCEBEB; color:#A32D2D; border:none; border-radius:8px; padding:7px 14px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }
        .admin-btn-recusar:hover { background:#A32D2D; color:#fff; transform:translateY(-2px); box-shadow:0 4px 12px rgba(163,45,45,0.3); }
        .admin-btn-recusar:active { transform:scale(0.96); }
        .admin-bar-wrap { margin-bottom:14px; }
        .admin-bar-label { display:flex; justify-content:space-between; margin-bottom:6px; align-items:center; }
        .admin-bar-label span { font-size:13px; font-weight:600; color:#2C2C2A; }
        .admin-bar-qtd { font-size:12px; color:#888; font-weight:500; }
        .admin-bar-bg { background:#F1EFE8; border-radius:99px; height:8px; overflow:hidden; }
        .admin-bar-fill { height:100%; background:linear-gradient(90deg,#1D9E75,#16A085); border-radius:99px; transition:width 0.6s cubic-bezier(0.22,1,0.36,1); box-shadow:0 0 8px rgba(29,158,117,0.3); }
      `}</style>
    </div>
  )
}