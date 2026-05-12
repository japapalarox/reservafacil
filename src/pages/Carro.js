// src/pages/Carro.js
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'

const HORARIOS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

function hoje() { return new Date().toISOString().split('T')[0] }

export default function Carro() {
  const { profile }                = useAuth()
  const { reservas, criarReserva } = useReservas(profile)

  const [form, setForm] = useState({
    dataInicio: hoje(),
    dataFim:    hoje(),
    inicio: '08:00',
    fim:    '18:00',
    motivo: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk]             = useState(false)
  const [erro, setErro]         = useState('')

  // Verifica conflito em qualquer dia do período
  function temConflito() {
    const d1 = new Date(form.dataInicio)
    const d2 = new Date(form.dataFim)
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split('T')[0]
      const conflito = reservas.some(r =>
        r.tipo === 'carro' && r.data === dataStr && r.status !== 'cancelado' &&
        !(form.fim <= r.inicio || form.inicio >= r.fim)
      )
      if (conflito) return dataStr
    }
    return null
  }

  function diasPeriodo() {
    const d1 = new Date(form.dataInicio)
    const d2 = new Date(form.dataFim)
    const dias = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
    return dias
  }

  // Próximas reservas do carro
  const proximasReservas = reservas
    .filter(r => r.tipo === 'carro' && r.data >= hoje() && r.status !== 'cancelado')
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 5)

  async function salvar() {
    if (!form.motivo.trim()) { setErro('Informe o destino / motivo.'); return }
    if (form.dataFim < form.dataInicio) { setErro('Data de devolução não pode ser antes da retirada.'); return }
    const conf = temConflito()
    if (conf) { setErro(`Conflito de horário no dia ${new Date(conf+'T12:00').toLocaleDateString('pt-BR')}.`); return }

    setErro('')
    setSalvando(true)
    try {
      // Cria uma reserva por dia do período
      const d1 = new Date(form.dataInicio)
      const d2 = new Date(form.dataFim)
      for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        const dataStr = d.toISOString().split('T')[0]
        await criarReserva({
          tipo: 'carro', sala_id: null, item_id: null,
          data: dataStr,
          inicio: form.inicio,
          fim: form.fim,
          motivo: form.motivo + (diasPeriodo() > 1 ? ` (${form.dataInicio} → ${form.dataFim})` : '')
        })
      }
      setOk(true)
      setTimeout(() => { setOk(false); setForm({ dataInicio: hoje(), dataFim: hoje(), inicio: '08:00', fim: '18:00', motivo: '' }) }, 2500)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar reserva.')
    } finally {
      setSalvando(false)
    }
  }

  const conflito = temConflito()
  const dias     = diasPeriodo()

  return (
    <div style={s.wrap}>
      <h2 style={s.titulo}>Reserva do Gol</h2>

      <div style={s.card}>
        {ok ? (
          <div style={s.okBox}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ marginBottom: 6 }}>Gol Reservado!</h3>
            <p style={{ color: '#888', fontSize: 13 }}>
              {form.dataInicio === form.dataFim
                ? new Date(form.dataInicio+'T12:00').toLocaleDateString('pt-BR')
                : `${new Date(form.dataInicio+'T12:00').toLocaleDateString('pt-BR')} → ${new Date(form.dataFim+'T12:00').toLocaleDateString('pt-BR')}`
              }
              <br/>{form.inicio} às {form.fim}
            </p>
          </div>
        ) : (
          <>
            {/* Header do carro */}
            <div style={s.carroHeader}>
              <div style={s.carroIcone}>🚗</div>
              <div>
                <div style={s.carroNome}>Volkswagen Gol</div>
                <div style={s.carroInfo}>Placa ABC-1234 · Branco · 2020</div>
              </div>
            </div>

            {/* Período */}
            <div style={s.secao}>
              <p style={s.secaoTitulo}>📅 Período de uso</p>
              <div style={s.periodoGrid}>
                <div style={s.campo}>
                  <label style={s.label}>Data de retirada</label>
                  <input type="date" value={form.dataInicio} min={hoje()}
                    onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value, dataFim: e.target.value > f.dataFim ? e.target.value : f.dataFim }))}
                    style={s.inputData}/>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Data de devolução</label>
                  <input type="date" value={form.dataFim} min={form.dataInicio}
                    onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))}
                    style={s.inputData}/>
                </div>
              </div>
              {dias > 1 && (
                <div style={s.diasTag}>📆 {dias} dias de uso</div>
              )}
            </div>

            {/* Horários */}
            <div style={s.secao}>
              <p style={s.secaoTitulo}>⏰ Horário diário</p>
              <div style={s.periodoGrid}>
                <div style={s.campo}>
                  <label style={s.label}>Retirada</label>
                  <select value={form.inicio} onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))} style={s.select}>
                    {HORARIOS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Devolução</label>
                  <select value={form.fim} onChange={e => setForm(f => ({ ...f, fim: e.target.value }))} style={s.select}>
                    {HORARIOS.filter(h => h > form.inicio).map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={s.campo}>
              <label style={s.label}>Destino / Motivo</label>
              <input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                placeholder="Ex: Visita ao cliente em São Paulo" style={s.input}/>
            </div>

            {conflito && <p style={s.aviso}>⚠️ Conflito de horário no dia {new Date(conflito+'T12:00').toLocaleDateString('pt-BR')}.</p>}
            {erro     && <p style={s.erro}>{erro}</p>}

            <button onClick={salvar} disabled={salvando || !!conflito} style={{ ...s.btn, opacity: conflito ? .5 : 1 }}>
              {salvando ? 'Salvando…' : `✓ Reservar Gol${dias > 1 ? ` (${dias} dias)` : ''}`}
            </button>
          </>
        )}
      </div>

      {/* Próximas reservas */}
      {proximasReservas.length > 0 && (
        <div style={s.card}>
          <p style={s.secaoTitulo}>📋 Próximas reservas do Gol</p>
          {proximasReservas.map(r => (
            <div key={r.id} style={s.reservaItem}>
              <div style={s.reservaData}>{new Date(r.data+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
              <div style={s.reservaInfo}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.autor?.nome || 'Usuário'}</div>
                <div style={{ fontSize: 12, color: '#A07060' }}>{r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)} · {r.motivo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:        { maxWidth: 600, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 },
  titulo:      { fontSize: 20, fontWeight: 700, color: '#3A1F0D', marginBottom: 4 },
  card:        { background: '#fff', borderRadius: 14, border: '1.5px solid #FFE4CC', padding: 24, boxShadow: '0 2px 8px rgba(255,107,26,0.06)' },
  carroHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  carroIcone:  { width: 52, height: 52, background: '#FFF0E6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  carroNome:   { fontWeight: 700, fontSize: 16, color: '#3A1F0D' },
  carroInfo:   { fontSize: 12, color: '#A07060', marginTop: 2 },
  secao:       { marginBottom: 16 },
  secaoTitulo: { fontSize: 13, fontWeight: 700, color: '#7A5540', marginBottom: 10 },
  periodoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  campo:       { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  label:       { fontSize: 12, fontWeight: 600, color: '#7A5540' },
  inputData:   { padding: '9px 12px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  select:      { padding: '9px 12px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  input:       { padding: '10px 14px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  diasTag:     { background: '#FFF0E6', color: '#C44D00', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, display: 'inline-block', marginTop: 6 },
  aviso:       { fontSize: 13, color: '#854F0B', background: '#FFF8E0', padding: '8px 12px', borderRadius: 8, marginBottom: 8 },
  erro:        { fontSize: 13, color: '#D94000', background: '#FFF0EA', padding: '8px 12px', borderRadius: 8, marginBottom: 8 },
  btn:         { width: '100%', padding: 13, background: 'linear-gradient(135deg,#FF8C3A,#FF6B1A)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,107,26,0.3)', transition: 'opacity .15s' },
  okBox:       { textAlign: 'center', padding: '20px 0' },
  reservaItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #FFE4CC' },
  reservaData: { background: '#FFF0E6', color: '#C44D00', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 8, flexShrink: 0 },
  reservaInfo: { flex: 1 },
}
