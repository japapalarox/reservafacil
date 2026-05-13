// src/pages/Manutencao.js
import React from 'react'

export default function Manutencao() {
  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.icone}>🔧</div>
        <h2 style={s.titulo}>Em Manutenção</h2>
        <p style={s.sub}>Esta funcionalidade está sendo desenvolvida e estará disponível em breve.</p>
      </div>
    </div>
  )
}

const s = {
  wrap:  { maxWidth: 960, margin: '0 auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  card:  { background: '#fff', borderRadius: 20, border: '1.5px solid #FFE4CC', padding: '48px 36px', textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(255,107,26,0.08)' },
  icone: { fontSize: 56, marginBottom: 16 },
  titulo:{ fontSize: 22, fontWeight: 800, color: '#3A1F0D', marginBottom: 10 },
  sub:   { fontSize: 14, color: '#A07060', lineHeight: 1.6 },
}
