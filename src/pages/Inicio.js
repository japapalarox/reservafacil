// src/pages/Inicio.js
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'

function hoje() { return new Date().toISOString().split('T')[0] }

const STATUS_MAP = {
  confirmado: { label: 'Confirmado', bg: '#EAF3DE', color: '#3B6D11' },
  pendente:   { label: 'Pendente',   bg: '#FAEEDA', color: '#854F0B' },
  cancelado:  { label: 'Cancelado',  bg: '#FCEBEB', color: '#A32D2D' },
}

export default function Inicio() {
  const { profile }         = useAuth()
  const { reservas }        = useReservas(profile)
  const navigate            = useNavigate()

  const minhas  = reservas.filter(r => r.user_id === profile?.id)
  const proximas = minhas.filter(r => r.data >= hoje() && r.status !== 'cancelado').slice(0, 4)

  return (
    <div>
      {/* Banner */}
      <div style={s.banner}>
        <p style={s.bannerSub}>Olá, {profile?.nome?.split(' ')[0]} 👋</p>
        <h2 style={s.bannerTitulo}>O que deseja reservar hoje?</h2>
        <div style={s.bannerBtns}>
          <button onClick={() => navigate('/salas')} style={s.bannerBtn}>
            🏢 Reservar Sala
          </button>
          <button onClick={() => navigate('/carro')} style={s.bannerBtn}>
            🚗 Reservar Gol
          </button>
        </div>
      </div>

      <div style={s.wrap}>
        <h3 style={s.secTitulo}>Suas próximas reservas</h3>

        {proximas.length === 0 ? (
          <div style={s.vazio}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <p>Nenhuma reserva futura.</p>
            <button onClick={() => navigate('/salas')} style={s.vazioBtn}>
              Fazer primeira reserva
            </button>
          </div>
        ) : (
          <div style={s.lista}>
            {proximas.map(r => {
              const st    = STATUS_MAP[r.status] || STATUS_MAP.confirmado
              const nome  = r.tipo === 'carro' ? 'Gol' : r.sala?.nome
              return (
                <div key={r.id} style={s.item}>
                  <div style={{ ...s.iconeBox, background: r.tipo === 'carro' ? '#E6F1FB' : '#E1F5EE' }}>
                    {r.tipo === 'carro' ? '🚗' : '🏢'}
                  </div>
                  <div style={s.itemInfo}>
                    <div style={s.itemNome}>{nome}</div>
                    <div style={s.itemSub}>
                      {new Date(r.data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {' · '}{r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)}
                    </div>
                    <div style={s.itemMotivo}>{r.motivo}</div>
                  </div>
                  <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  banner:      { background: 'linear-gradient(135deg, #085041, #1D9E75)', padding: '32px 16px 36px' },
  bannerSub:   { color: 'rgba(255,255,255,.75)', fontSize: 13, marginBottom: 4 },
  bannerTitulo:{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 16 },
  bannerBtns:  { display: 'flex', gap: 10, flexWrap: 'wrap' },
  bannerBtn:   { background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.35)', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  wrap:        { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  secTitulo:   { fontSize: 16, fontWeight: 700, marginBottom: 14 },
  vazio:       { textAlign: 'center', padding: '40px 20px', color: '#888', background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7' },
  vazioBtn:    { marginTop: 14, padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  lista:       { display: 'flex', flexDirection: 'column', gap: 10 },
  item:        { background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 },
  iconeBox:    { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  itemInfo:    { flex: 1, minWidth: 0 },
  itemNome:    { fontWeight: 600, fontSize: 15 },
  itemSub:     { fontSize: 12, color: '#888', marginTop: 2 },
  itemMotivo:  { fontSize: 12, color: '#5F5E5A', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge:       { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0 },
}
