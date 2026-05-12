// src/pages/Historico.js
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'

const STATUS_MAP = {
  confirmado: { label: 'Confirmado', bg: '#EAF3DE', color: '#3B6D11' },
  pendente:   { label: 'Pendente',   bg: '#FAEEDA', color: '#854F0B' },
  cancelado:  { label: 'Cancelado',  bg: '#FCEBEB', color: '#A32D2D' },
}

export default function Historico() {
  const { profile }                    = useAuth()
  const { reservas, cancelarReserva, loading } = useReservas(profile)
  const [filtro, setFiltro]            = useState('todos')
  const [confirmando, setConfirmando]  = useState(null)

  const filtradas = reservas.filter(r => {
    if (filtro === 'todos')      return true
    if (filtro === 'sala')       return r.tipo === 'sala'
    if (filtro === 'carro')      return r.tipo === 'carro'
    return r.status === filtro
  })

  async function cancelar(id) {
    setConfirmando(null)
    await cancelarReserva(id)
  }

  if (loading) return (
    <div className="hist-loading">
      <div className="hist-loading-emoji">📋</div>
      Carregando…
    </div>
  )

  return (
    <div className="hist-root">
      <div className="hist-top-bar">
        <h2 className="hist-titulo">Histórico de Reservas</h2>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="hist-select">
          <option value="todos">Todos</option>
          <option value="sala">Salas</option>
          <option value="carro">Carro</option>
          <option value="confirmado">Confirmados</option>
          <option value="pendente">Pendentes</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="hist-vazio">
          <div className="hist-vazio-emoji">📋</div>
          <p className="hist-vazio-texto">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <div className="hist-lista">
          {filtradas.map(r => {
            const st     = STATUS_MAP[r.status] || STATUS_MAP.confirmado
            const nome   = r.tipo === 'carro' ? 'Gol' : r.sala?.nome
            const autor  = r.autor?.nome
            const podeCancelar = r.status !== 'cancelado' &&
              (profile?.papel === 'admin' || r.user_id === profile?.id)

            return (
              <div key={r.id} className="hist-item">
                <div className="hist-icone-box" style={{ background: r.tipo === 'carro' ? '#E6F1FB' : '#E1F5EE' }}>
                  {r.tipo === 'carro' ? '🚗' : '🏢'}
                </div>
                <div className="hist-item-info">
                  <div className="hist-item-nome">{nome}</div>
                  <div className="hist-item-sub">
                    {new Date(r.data + 'T12:00').toLocaleDateString('pt-BR')} · {r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)}
                    {profile?.papel === 'admin' && autor && (
                      <span className="hist-autor-tag"> · {autor}</span>
                    )}
                  </div>
                  <div className="hist-item-motivo">{r.motivo}</div>
                </div>
                <div className="hist-item-right">
                  <span className="hist-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  {podeCancelar && (
                    <button onClick={() => setConfirmando(r.id)} className="hist-btn-cancel">✕</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmação de cancelamento */}
      {confirmando && (
        <div className="hist-overlay" onClick={() => setConfirmando(null)}>
          <div className="hist-dialog" onClick={e => e.stopPropagation()}>
            <div className="hist-dialog-icon">⚠️</div>
            <h3 className="hist-dialog-titulo">Cancelar reserva?</h3>
            <p className="hist-dialog-sub">Esta ação não pode ser desfeita.</p>
            <div className="hist-dialog-btns">
              <button onClick={() => setConfirmando(null)} className="hist-btn-sec">Voltar</button>
              <button onClick={() => cancelar(confirmando)} className="hist-btn-danger">Sim, cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hist-root { max-width:900px; margin:0 auto; padding:24px 16px; animation:fadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .hist-loading { padding:48px; text-align:center; color:#888; animation:fadeIn 0.3s ease; }
        .hist-loading-emoji { font-size:32px; margin-bottom:10px; animation:floatEmoji 3s ease-in-out infinite; }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        .hist-top-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
        .hist-titulo { font-size:22px; font-weight:800; color:#2C2C2A; letter-spacing:-0.3px; }
        .hist-select { padding:9px 14px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#FFFAF7; color:#3A1F0D; cursor:pointer; transition:all 0.2s; }
        .hist-select:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); }
        .hist-vazio { text-align:center; padding:60px 20px; color:#888; animation:fadeIn 0.4s ease; }
        .hist-vazio-emoji { font-size:40px; margin-bottom:12px; animation:floatEmoji 3s ease-in-out infinite; }
        .hist-vazio-texto { font-size:15px; }
        .hist-lista { display:flex; flex-direction:column; gap:10px; }
        .hist-item { background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); border-radius:14px; border:1px solid rgba(211,209,199,0.5); padding:14px 18px; display:flex; align-items:center; gap:14px; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.2s ease; }
        .hist-item:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); border-color:rgba(255,107,26,0.15); }
        .hist-icone-box { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .hist-item:hover .hist-icone-box { transform:scale(1.1) rotate(-4deg); }
        .hist-item-info { flex:1; min-width:0; }
        .hist-item-nome { font-weight:600; font-size:15px; color:#2C2C2A; }
        .hist-item-sub { font-size:12px; color:#888; margin-top:2px; }
        .hist-autor-tag { color:#1D9E75; font-weight:600; }
        .hist-item-motivo { font-size:12px; color:#5F5E5A; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .hist-item-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .hist-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .hist-btn-cancel { background:#FCEBEB; color:#A32D2D; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px; transition:all 0.2s; display:flex; align-items:center; justify-content:center; width:32px; height:32px; }
        .hist-btn-cancel:hover { background:#E24B4A; color:#fff; transform:scale(1.1); }
        .hist-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:200; animation:fadeIn 0.2s ease; }
        .hist-dialog { background:#fff; border-radius:18px; padding:28px; width:320px; text-align:center; box-shadow:0 24px 60px rgba(0,0,0,0.2); animation:modalIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(0.96);} to{opacity:1;transform:none;} }
        .hist-dialog-icon { font-size:40px; margin-bottom:10px; animation:shakeIcon 0.5s ease; }
        @keyframes shakeIcon { 0%,100%{transform:rotate(0);} 25%{transform:rotate(-8deg);} 75%{transform:rotate(8deg);} }
        .hist-dialog-titulo { margin-bottom:6px; font-size:17px; }
        .hist-dialog-sub { font-size:14px; color:#888; margin-bottom:20px; }
        .hist-dialog-btns { display:flex; gap:10px; }
        .hist-btn-sec { flex:1; padding:11px; border:1.5px solid #FFD4B8; border-radius:10px; background:#fff; cursor:pointer; font-family:inherit; font-size:14px; font-weight:600; color:#7A5540; transition:all 0.2s; }
        .hist-btn-sec:hover { background:#FFFAF7; border-color:#FF6B1A; color:#FF6B1A; }
        .hist-btn-danger { flex:1; padding:11px; border:none; border-radius:10px; background:linear-gradient(135deg,#E24B4A,#C0392B); color:#fff; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; transition:all 0.2s; box-shadow:0 4px 12px rgba(226,75,74,0.3); }
        .hist-btn-danger:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(226,75,74,0.4); filter:brightness(1.05); }
        .hist-btn-danger:active { transform:scale(0.97); }
      `}</style>
    </div>
  )
}