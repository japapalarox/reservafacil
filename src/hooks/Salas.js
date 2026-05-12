// src/pages/Salas.js
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSalas, useReservas } from '../hooks/useReservas'

const HORARIOS = ['07:00','08:00','09:00','10:00','11:00','12:00',
                  '13:00','14:00','15:00','16:00','17:00','18:00','19:00']

function hoje() { return new Date().toISOString().split('T')[0] }

// Ícone visual por nome da sala
function iconesSala(nome) {
  const n = nome.toLowerCase()
  if (n.includes('forimagem'))  return { emoji: '🖼️', bg: '#E6F1FB', cor: '#185FA5' }
  if (n.includes('subsolo'))    return { emoji: '⬇️', bg: '#FAEEDA', cor: '#633806' }
  if (n.includes('acima'))      return { emoji: '⬆️', bg: '#EAF3DE', cor: '#27500A' }
  if (n.includes('direita'))    return { emoji: '➡️', bg: '#E1F5EE', cor: '#085041' }
  if (n.includes('esquerda'))   return { emoji: '⬅️', bg: '#EEEDFE', cor: '#3C3489' }
  if (n.includes('custód') || n.includes('custodia')) return { emoji: '🔒', bg: '#FCEBEB', cor: '#791F1F' }
  return { emoji: '🏢', bg: '#F1EFE8', cor: '#444441' }
}

export default function Salas() {
  const { profile }            = useAuth()
  const { salas, loading: ls, erro: erroSalas } = useSalas()
  const { reservas, criarReserva } = useReservas(profile)

  const [dataSel, setDataSel]   = useState(hoje())
  const [salaSel, setSalaSel]   = useState(null)
  const [form, setForm]         = useState({ inicio: '09:00', fim: '10:00', motivo: '' })
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk]             = useState(false)
  const [erro, setErro]         = useState('')

  function estaOcupada(salaId) {
    return reservas.some(r =>
      r.tipo === 'sala' &&
      r.sala_id === salaId &&
      r.data === dataSel &&
      r.status !== 'cancelado' &&
      !(form.fim <= r.inicio || form.inicio >= r.fim)
    )
  }

  // Reservas da sala no dia selecionado
  function reservasDaSala(salaId) {
    return reservas
      .filter(r => r.tipo === 'sala' && r.sala_id === salaId && r.data === dataSel && r.status !== 'cancelado')
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
  }

  async function salvar() {
    if (!form.motivo.trim()) { setErro('Informe o motivo da reunião.'); return }
    if (estaOcupada(salaSel.id)) { setErro('Horário já ocupado.'); return }
    setErro('')
    setSalvando(true)
    try {
      await criarReserva({ tipo: 'sala', sala_id: salaSel.id, data: dataSel, ...form })
      setOk(true)
      setTimeout(() => {
        setOk(false)
        setSalaSel(null)
        setForm({ inicio: '09:00', fim: '10:00', motivo: '' })
      }, 2200)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar reserva.')
    } finally {
      setSalvando(false)
    }
  }

  if (erroSalas) return (
    <div style={{ padding: 32, background: '#FCEBEB', margin: 16, borderRadius: 12, color: '#A32D2D', fontSize: 14 }}>
      <strong>Erro ao carregar salas:</strong><br/>{erroSalas}
    </div>
  )

  if (ls) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
      Carregando salas…
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* Cabeçalho */}
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Salas de Reunião</h2>
          <p style={s.sub}>{salas.length} salas disponíveis</p>
        </div>
        <div style={s.filtro}>
          <span style={s.filtroLabel}>📅 Data</span>
          <input type="date" value={dataSel} min={hoje()}
            onChange={e => setDataSel(e.target.value)} style={s.inputData} />
        </div>
      </div>

      {salas.length === 0 && (
        <div style={s.vazioBox}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏗️</div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma sala cadastrada</p>
          <p style={{ fontSize: 13, color: '#888' }}>Execute o SQL de atualização no Supabase e recarregue a página.</p>
        </div>
      )}

      {/* Grid de cards */}
      <div style={s.grid}>
        {salas.map(sala => {
          const livre    = !estaOcupada(sala.id)
          const icone    = iconesSala(sala.nome)
          const resHoje  = reservasDaSala(sala.id)

          return (
            <div key={sala.id} onClick={() => setSalaSel(sala)} style={{
              ...s.card,
              borderColor: livre ? '#D3D1C7' : '#F0997B',
              borderLeftColor: icone.cor,
              borderLeftWidth: 4,
            }}>
              {/* Topo do card */}
              <div style={s.cardTopo}>
                <div style={{ ...s.iconeBox, background: icone.bg }}>
                  <span style={{ fontSize: 22 }}>{icone.emoji}</span>
                </div>
                <span style={{ ...s.badge, ...(livre ? s.badgeOk : s.badgeErr) }}>
                  {livre ? '● Livre' : '● Ocupada'}
                </span>
              </div>

              {/* Nome */}
              <div style={s.salaNome}>{sala.nome}</div>
              <div style={s.salaCap}>👥 {sala.capacidade} pessoas</div>

              {/* Recursos */}
              {sala.recursos?.length > 0 && (
                <div style={s.recursos}>
                  {sala.recursos.map(r => (
                    <span key={r} style={s.tag}>{r}</span>
                  ))}
                </div>
              )}

              {/* Reservas do dia */}
              {resHoje.length > 0 && (
                <div style={s.agendaDia}>
                  {resHoje.map(r => (
                    <div key={r.id} style={s.agendaItem}>
                      🕐 {r.inicio.slice(0,5)}–{r.fim.slice(0,5)}
                      <span style={s.agendaMotivo}>{r.motivo}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão */}
              <button style={{ ...s.btnCard, background: icone.bg, color: icone.cor }}
                onClick={e => { e.stopPropagation(); setSalaSel(sala) }}>
                + Reservar esta sala
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {salaSel && (
        <div style={s.overlay} onClick={() => setSalaSel(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {ok ? (
              <div style={s.okBox}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ marginBottom: 6 }}>Reserva Confirmada!</h3>
                <p style={{ color: '#888', fontSize: 13 }}>
                  {salaSel.nome}<br/>
                  {new Date(dataSel + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}<br/>
                  {form.inicio} às {form.fim}
                </p>
              </div>
            ) : (
              <>
                <div style={s.modalTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...s.iconeBox, background: iconesSala(salaSel.nome).bg, width: 44, height: 44 }}>
                      <span style={{ fontSize: 20 }}>{iconesSala(salaSel.nome).emoji}</span>
                    </div>
                    <div>
                      <h3 style={s.modalTitulo}>{salaSel.nome}</h3>
                      <p style={s.modalSub}>👥 {salaSel.capacidade} pessoas</p>
                    </div>
                  </div>
                  <button onClick={() => setSalaSel(null)} style={s.fechar}>✕</button>
                </div>

                <div style={s.formGrid}>
                  <div style={s.campo}>
                    <label style={s.label}>Início</label>
                    <select value={form.inicio}
                      onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
                      style={s.select}>
                      {HORARIOS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div style={s.campo}>
                    <label style={s.label}>Fim</label>
                    <select value={form.fim}
                      onChange={e => setForm(f => ({ ...f, fim: e.target.value }))}
                      style={s.select}>
                      {HORARIOS.filter(h => h > form.inicio).map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div style={s.campo}>
                  <label style={s.label}>Motivo / Assunto</label>
                  <input value={form.motivo}
                    onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                    placeholder="Ex: Reunião de planejamento"
                    style={s.input} />
                </div>

                {erro && <p style={s.erro}>{erro}</p>}

                <button onClick={salvar} disabled={salvando} style={s.btn}>
                  {salvando ? 'Salvando…' : '✓ Confirmar Reserva'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:       { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  titulo:     { fontSize: 20, fontWeight: 700, color: '#2C2C2A', marginBottom: 2 },
  sub:        { fontSize: 13, color: '#888' },
  filtro:     { display: 'flex', alignItems: 'center', gap: 8 },
  filtroLabel:{ fontSize: 13, color: '#5F5E5A' },
  inputData:  { padding: '8px 12px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  vazioBox:   { textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', color: '#5F5E5A' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 },
  card:       { background: '#fff', borderRadius: 14, border: '1px solid #D3D1C7', borderLeft: '4px solid #D3D1C7', padding: '18px 18px 14px', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', display: 'flex', flexDirection: 'column', gap: 8 },
  cardTopo:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconeBox:   { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge:      { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  badgeOk:    { background: '#EAF3DE', color: '#3B6D11' },
  badgeErr:   { background: '#FCEBEB', color: '#A32D2D' },
  salaNome:   { fontWeight: 700, fontSize: 16, color: '#2C2C2A' },
  salaCap:    { fontSize: 12, color: '#888' },
  recursos:   { display: 'flex', flexWrap: 'wrap', gap: 4 },
  tag:        { fontSize: 11, background: '#F1EFE8', color: '#5F5E5A', padding: '2px 8px', borderRadius: 20 },
  agendaDia:  { borderTop: '1px solid #F1EFE8', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  agendaItem: { fontSize: 11, color: '#854F0B', background: '#FAEEDA', borderRadius: 6, padding: '4px 8px', display: 'flex', gap: 6 },
  agendaMotivo: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  btnCard:    { marginTop: 4, padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 },
  modal:      { background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  modalTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitulo:{ fontSize: 17, fontWeight: 700, margin: 0 },
  modalSub:   { fontSize: 12, color: '#888', marginTop: 3 },
  fechar:     { background: '#F1EFE8', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14 },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  campo:      { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  label:      { fontSize: 12, fontWeight: 600, color: '#5F5E5A' },
  select:     { padding: '9px 12px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  input:      { padding: '10px 14px', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' },
  erro:       { fontSize: 13, color: '#E24B4A', marginBottom: 10 },
  btn:        { width: '100%', padding: 13, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  okBox:      { textAlign: 'center', padding: '20px 0' },
}
