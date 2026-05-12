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

  if (loading) return <p style={{ padding: 32, color: '#888' }}>Carregando…</p>

  return (
    <div style={s.wrap}>
      <div style={s.topBar}>
        <h2 style={s.titulo}>Histórico de Reservas</h2>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={s.select}>
          <option value="todos">Todos</option>
          <option value="sala">Salas</option>
          <option value="carro">Carro</option>
          <option value="confirmado">Confirmados</option>
          <option value="pendente">Pendentes</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div style={s.vazio}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <div style={s.lista}>
          {filtradas.map(r => {
            const st     = STATUS_MAP[r.status] || STATUS_MAP.confirmado
            const nome   = r.tipo === 'carro' ? 'Gol' : r.sala?.nome
            const autor  = r.autor?.nome
            const podeCancelar = r.status !== 'cancelado' &&
              (profile?.papel === 'admin' || r.user_id === profile?.id)

            return (
              <div key={r.id} style={s.item}>
                <div style={{ ...s.iconeBox, background: r.tipo === 'carro' ? '#E6F1FB' : '#E1F5EE' }}>
                  {r.tipo === 'carro' ? '🚗' : '🏢'}
                </div>
                <div style={s.itemInfo}>
                  <div style={s.itemNome}>{nome}</div>
                  <div style={s.itemSub}>
                    {new Date(r.data + 'T12:00').toLocaleDateString('pt-BR')} · {r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)}
                    {profile?.papel === 'admin' && autor && (
                      <span style={s.autorTag}> · {autor}</span>
                    )}
                  </div>
                  <div style={s.itemMotivo}>{r.motivo}</div>
                </div>
                <div style={s.itemRight}>
                  <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
                  {podeCancelar && (
                    <button onClick={() => setConfirmando(r.id)} style={s.btnCancel}>✕</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmação de cancelamento */}
      {confirmando && (
        <div style={s.overlay}>
          <div style={s.dialog}>
            <h3 style={{ marginBottom: 10 }}>Cancelar reserva?</h3>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmando(null)} style={s.btnSec}>Voltar</button>
              <button onClick={() => cancelar(confirmando)} style={s.btnDanger}>Sim, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:      { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  topBar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo:    { fontSize: 20, fontWeight: 700 },
  select:    { padding: '8px 12px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  vazio:     { textAlign: 'center', padding: '60px 20px', color: '#888' },
  lista:     { display: 'flex', flexDirection: 'column', gap: 10 },
  item:      { background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 },
  iconeBox:  { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  itemInfo:  { flex: 1, minWidth: 0 },
  itemNome:  { fontWeight: 600, fontSize: 15 },
  itemSub:   { fontSize: 12, color: '#888', marginTop: 2 },
  autorTag:  { color: '#1D9E75' },
  itemMotivo:{ fontSize: 12, color: '#5F5E5A', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  badge:     { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  btnCancel: { background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  dialog:    { background: '#fff', borderRadius: 16, padding: 28, width: 320, textAlign: 'center' },
  btnSec:    { flex: 1, padding: '11px', border: '1px solid #D3D1C7', borderRadius: 10, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 },
  btnDanger: { flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: '#E24B4A', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 },
}
