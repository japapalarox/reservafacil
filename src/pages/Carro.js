// src/pages/Carro.js
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'

const HORARIOS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

function hoje() { return new Date().toISOString().split('T')[0] }

export default function Carro() {
  const { profile }               = useAuth()
  const { reservas, criarReserva } = useReservas(profile)

  const [dataSel, setDataSel] = useState(hoje())
  const [form, setForm]       = useState({ inicio: '08:00', fim: '12:00', motivo: '' })
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk]           = useState(false)
  const [erro, setErro]       = useState('')

  const reservasDia = reservas.filter(r =>
    r.tipo === 'carro' && r.data === dataSel && r.status !== 'cancelado'
  )

  const ocupado = reservasDia.some(r =>
    !(form.fim <= r.inicio || form.inicio >= r.fim)
  )

  async function salvar() {
    if (!form.motivo.trim()) { setErro('Informe o destino / motivo.'); return }
    if (ocupado) { setErro('Horário conflita com reserva existente.'); return }
    setErro('')
    setSalvando(true)
    try {
      await criarReserva({ tipo: 'carro', sala_id: null, data: dataSel, ...form })
      setOk(true)
      setTimeout(() => { setOk(false); setForm({ inicio: '08:00', fim: '12:00', motivo: '' }) }, 2500)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar reserva.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={s.wrap}>
      <h2 style={s.titulo}>Reserva do Gol</h2>

      <div style={s.card}>
        {/* Cabeçalho do carro */}
        <div style={s.carroHeader}>
          <div style={s.carroIcone}>🚗</div>
          <div>
            <div style={s.carroNome}>Volkswagen Gol</div>
            <div style={s.carroInfo}>Placa ABC-1234 · Branco · 2020</div>
          </div>
        </div>

        {/* Filtro de data */}
        <div style={s.filtro}>
          <span>📅</span>
          <input type="date" value={dataSel} min={hoje()}
            onChange={e => setDataSel(e.target.value)} style={s.inputData} />
        </div>

        {/* Reservas do dia */}
        <div style={s.secao}>
          <p style={s.secaoTitulo}>Reservas para este dia:</p>
          {reservasDia.length === 0
            ? <p style={s.vazio}>✓ Carro livre neste dia</p>
            : reservasDia.map(r => (
              <div key={r.id} style={s.ocupBlock}>
                🕐 {r.inicio.slice(0,5)}–{r.fim.slice(0,5)} · {r.motivo}
              </div>
            ))
          }
        </div>

        {/* Formulário */}
        <div style={s.formGrid}>
          <div style={s.campo}>
            <label style={s.label}>Saída</label>
            <select value={form.inicio}
              onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
              style={s.select}>
              {HORARIOS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div style={s.campo}>
            <label style={s.label}>Retorno</label>
            <select value={form.fim}
              onChange={e => setForm(f => ({ ...f, fim: e.target.value }))}
              style={s.select}>
              {HORARIOS.filter(h => h > form.inicio).map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div style={s.campo}>
          <label style={s.label}>Destino / Motivo</label>
          <input value={form.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
            placeholder="Ex: Visita ao cliente"
            style={s.input} />
        </div>

        {ocupado && <p style={s.aviso}>⚠️ Horário conflita com reserva existente.</p>}
        {erro    && <p style={s.erro}>{erro}</p>}
        {ok      && <p style={s.sucesso}>✓ Gol reservado com sucesso!</p>}

        <button onClick={salvar} disabled={salvando || ocupado} style={{
          ...s.btn,
          opacity: ocupado ? .5 : 1,
        }}>
          {salvando ? 'Salvando…' : '✓ Reservar Gol'}
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap:       { maxWidth: 600, margin: '0 auto', padding: '24px 16px' },
  titulo:     { fontSize: 20, fontWeight: 700, marginBottom: 20 },
  card:       { background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', padding: 24 },
  carroHeader:{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  carroIcone: { width: 52, height: 52, background: '#E6F1FB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  carroNome:  { fontWeight: 700, fontSize: 16 },
  carroInfo:  { fontSize: 12, color: '#888', marginTop: 2 },
  filtro:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 },
  inputData:  { padding: '8px 12px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  secao:      { marginBottom: 20 },
  secaoTitulo:{ fontSize: 13, fontWeight: 600, color: '#5F5E5A', marginBottom: 8 },
  vazio:      { fontSize: 13, color: '#3B6D11' },
  ocupBlock:  { background: '#FCEBEB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#A32D2D', marginBottom: 6 },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  campo:      { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  label:      { fontSize: 12, fontWeight: 600, color: '#5F5E5A' },
  select:     { padding: '9px 12px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  input:      { padding: '10px 14px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  aviso:      { fontSize: 13, color: '#854F0B', marginBottom: 8 },
  erro:       { fontSize: 13, color: '#E24B4A', marginBottom: 8 },
  sucesso:    { fontSize: 13, color: '#3B6D11', background: '#EAF3DE', padding: '10px 14px', borderRadius: 8, marginBottom: 8 },
  btn:        { width: '100%', padding: 13, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
}
