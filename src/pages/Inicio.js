// src/pages/Inicio.js
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'

function hoje() { return new Date().toISOString().split('T')[0] }

const STATUS_MAP = {
  confirmado: { label:'Confirmado', bg:'#FFF0E6', color:'#C44D00' },
  pendente:   { label:'Pendente',   bg:'#FFF8E0', color:'#8A6A00' },
  cancelado:  { label:'Cancelado',  bg:'#FFECEC', color:'#C00000' },
}

export default function Inicio() {
  const { profile }   = useAuth()
  const { reservas }  = useReservas(profile)
  const navigate      = useNavigate()

  const minhas  = reservas.filter(r => r.user_id === profile?.id)
  const proximas = minhas.filter(r => r.data >= hoje() && r.status !== 'cancelado').slice(0, 4)

  return (
    <div className="inicio-root">
      {/* Banner */}
      <div className="inicio-banner">
        <div className="inicio-banner-bg" />
        <div className="inicio-banner-content">
          <p className="inicio-banner-sub">Olá, {profile?.nome?.split(' ')[0]} 👋</p>
          <h2 className="inicio-banner-titulo">O que deseja reservar?</h2>
          <div className="inicio-banner-btns">
            <button onClick={() => navigate('/salas')} className="inicio-banner-btn">
              <span>🏢</span> Reservar Sala
            </button>
            <button onClick={() => navigate('/carro')} className="inicio-banner-btn inicio-banner-btn-sec">
              <span>🚗</span> Reservar Gol
            </button>
          </div>
        </div>
      </div>

      <div className="inicio-wrap">
        <h3 className="inicio-sec-titulo">Suas próximas reservas</h3>
        {proximas.length === 0 ? (
          <div className="inicio-vazio">
            <div className="inicio-vazio-emoji">📅</div>
            <p className="inicio-vazio-titulo">Nenhuma reserva futura</p>
            <p className="inicio-vazio-sub">Clique abaixo para fazer sua primeira reserva</p>
            <button onClick={() => navigate('/salas')} className="inicio-vazio-btn">Reservar agora</button>
          </div>
        ) : (
          <div className="inicio-lista">
            {proximas.map(r => {
              const st   = STATUS_MAP[r.status] || STATUS_MAP.confirmado
              const nome = r.tipo === 'carro' ? 'Gol' : r.sala?.nome
              return (
                <div key={r.id} className="inicio-item">
                  <div className="inicio-icone-box" style={{ background: r.tipo === 'carro' ? '#FFF0E6' : '#FFF5EE' }}>
                    <span style={{ fontSize:22 }}>{r.tipo === 'carro' ? '🚗' : '🏢'}</span>
                  </div>
                  <div className="inicio-item-info">
                    <div className="inicio-item-nome">{nome}</div>
                    <div className="inicio-item-sub">
                      {new Date(r.data+'T12:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'})}
                      {' · '}{r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)}
                    </div>
                    <div className="inicio-item-motivo">{r.motivo}</div>
                  </div>
                  <span className="inicio-badge" style={{ background:st.bg, color:st.color }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .inicio-root { animation:fadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .inicio-banner { background:linear-gradient(135deg,#FF6B1A,#FF8C3A,#FFB347); padding:36px 16px 40px; position:relative; overflow:hidden; border-radius:0 0 24px 24px; margin:-20px -20px 20px; }
        .inicio-banner-bg { position:absolute; top:-40px; right:-40px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.08); animation:flutuarBanner 6s ease-in-out infinite; }
        @keyframes flutuarBanner { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-15px) rotate(3deg);} }
        .inicio-banner-content { max-width:960px; margin:0 auto; position:relative; z-index:1; padding:0 20px; }
        .inicio-banner-sub { color:rgba(255,255,255,0.85); font-size:14px; margin-bottom:4px; }
        .inicio-banner-titulo { color:#fff; font-size:26px; font-weight:800; margin-bottom:18px; letter-spacing:-0.3px; }
        .inicio-banner-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .inicio-banner-btn { background:#fff; color:#FF6B1A; border:none; border-radius:12px; padding:11px 20px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 4px 16px rgba(0,0,0,0.1); transition:all 0.2s ease; display:flex; align-items:center; gap:8px; }
        .inicio-banner-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,0.15); }
        .inicio-banner-btn:active { transform:scale(0.97); }
        .inicio-banner-btn-sec { background:rgba(255,255,255,0.2); color:#fff; box-shadow:none; border:1.5px solid rgba(255,255,255,0.4); }
        .inicio-banner-btn-sec:hover { background:rgba(255,255,255,0.3); }
        .inicio-wrap { max-width:960px; margin:0 auto; padding:0 16px 24px; }
        .inicio-sec-titulo { font-size:16px; font-weight:700; color:#5A2D0C; margin-bottom:14px; }
        .inicio-vazio { text-align:center; padding:40px 20px; background:rgba(255,255,255,0.7); backdrop-filter:blur(12px); border-radius:16px; border:1.5px solid #FFD4B8; animation:fadeIn 0.4s ease; }
        .inicio-vazio-emoji { font-size:36px; margin-bottom:10px; animation:floatEmoji 3s ease-in-out infinite; }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        .inicio-vazio-titulo { font-weight:700; color:#7A5540; margin-bottom:4px; }
        .inicio-vazio-sub { font-size:13px; color:#B08060; margin-bottom:16px; }
        .inicio-vazio-btn { padding:10px 24px; background:linear-gradient(135deg,#FF8C3A,#FF6B1A); color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(255,107,26,0.35); transition:all 0.2s ease; }
        .inicio-vazio-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(255,107,26,0.45); }
        .inicio-lista { display:flex; flex-direction:column; gap:10px; }
        .inicio-item { background:rgba(255,255,255,0.85); backdrop-filter:blur(8px); border-radius:14px; border:1.5px solid #FFE4CC; padding:14px 18px; display:flex; align-items:center; gap:14px; box-shadow:0 2px 8px rgba(255,107,26,0.06); transition:all 0.2s ease; cursor:pointer; }
        .inicio-item:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(255,107,26,0.12); border-color:#FFD4B8; }
        .inicio-icone-box { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .inicio-item:hover .inicio-icone-box { transform:scale(1.1) rotate(-4deg); }
        .inicio-item-info { flex:1; min-width:0; }
        .inicio-item-nome { font-weight:700; font-size:15px; color:#3A1F0D; }
        .inicio-item-sub { font-size:12px; color:#A07060; margin-top:2px; }
        .inicio-item-motivo { font-size:12px; color:#7A5540; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .inicio-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; flex-shrink:0; }
      `}</style>
    </div>
  )
}