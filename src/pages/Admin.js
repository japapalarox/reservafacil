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

  if (loading) return <p style={{ padding: 32, color: '#888' }}>Carregando…</p>

  return (
    <div style={s.wrap}>
      <h2 style={s.titulo}>Painel Administrativo</h2>

      {/* Stats */}
      <div style={s.statsGrid}>
        {stats.map(st => (
          <div key={st.label} style={{ ...s.statCard, background: st.bg }}>
            <div style={{ fontSize: 28 }}>{st.emoji}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: st.c }}>{st.val}</div>
            <div style={{ fontSize: 12, color: st.c }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Aprovações pendentes */}
      <div style={s.card}>
        <h3 style={s.cardTitulo}>
          ⏳ Aprovações Pendentes
          {pendentes.length > 0 && (
            <span style={s.countBadge}>{pendentes.length}</span>
          )}
        </h3>
        {pendentes.length === 0
          ? <p style={{ fontSize: 13, color: '#888' }}>Nenhum pendente ✓</p>
          : pendentes.map(r => {
            const autor = r.autor?.nome || '—'
            const recurso = r.tipo === 'carro' ? '🚗 Gol' : `🏢 ${r.sala?.nome}`
            return (
              <div key={r.id} style={s.pendItem}>
                <div style={s.pendInfo}>
                  <div style={s.pendNome}>{autor} — {recurso}</div>
                  <div style={s.pendSub}>
                    {r.data} · {r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)} · {r.motivo}
                  </div>
                </div>
                <div style={s.pendAcoes}>
                  <button onClick={() => atualizarStatus(r.id, 'confirmado')} style={s.btnAprovar}>
                    ✓ Aprovar
                  </button>
                  <button onClick={() => atualizarStatus(r.id, 'cancelado')} style={s.btnRecusar}>
                    ✕ Recusar
                  </button>
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Ocupação por sala */}
      <div style={s.card}>
        <h3 style={s.cardTitulo}>📊 Ocupação por Sala</h3>
        {salas.map(sala => {
          const qtd = reservas.filter(r => r.tipo === 'sala' && r.sala_id === sala.id && r.status === 'confirmado').length
          const pct = Math.min(100, qtd * 15)
          return (
            <div key={sala.id} style={{ marginBottom: 12 }}>
              <div style={s.barLabel}>
                <span style={{ fontSize: 13 }}>{sala.nome}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{qtd} reservas</span>
              </div>
              <div style={s.barBg}>
                <div style={{ ...s.barFill, width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  wrap:       { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  titulo:     { fontSize: 20, fontWeight: 700, marginBottom: 20 },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 },
  statCard:   { borderRadius: 14, padding: '18px 14px', textAlign: 'center' },
  card:       { background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', padding: 20, marginBottom: 16 },
  cardTitulo: { fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { background: '#FAEEDA', color: '#854F0B', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20 },
  pendItem:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1EFE8' },
  pendInfo:   { flex: 1, minWidth: 0 },
  pendNome:   { fontWeight: 600, fontSize: 14 },
  pendSub:    { fontSize: 12, color: '#888', marginTop: 2 },
  pendAcoes:  { display: 'flex', gap: 8, flexShrink: 0 },
  btnAprovar: { background: '#EAF3DE', color: '#3B6D11', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnRecusar: { background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  barLabel:   { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  barBg:      { background: '#F1EFE8', borderRadius: 99, height: 8, overflow: 'hidden' },
  barFill:    { height: '100%', background: '#1D9E75', borderRadius: 99, transition: 'width .4s' },
}
