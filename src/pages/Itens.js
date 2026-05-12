// src/pages/Itens.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'
import { supabase } from '../lib/supabase'

const HORARIOS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

function hoje() { return new Date().toISOString().split('T')[0] }

const ICONES = {
  'projetor': { emoji: '📽️', bg: '#EEF2FF', cor: '#3730A3' },
  'tv':       { emoji: '📺', bg: '#FFF0E6', cor: '#C44D00' },
  'jbl':      { emoji: '🔊', bg: '#ECFDF5', cor: '#065F46' },
}

function iconeItem(nome) {
  const n = nome.toLowerCase()
  for (const key of Object.keys(ICONES)) {
    if (n.includes(key)) return ICONES[key]
  }
  return { emoji: '📦', bg: '#F3F4F6', cor: '#374151' }
}

export default function Itens() {
  const { profile }                = useAuth()
  const { reservas, criarReserva } = useReservas(profile)

  const [itens, setItens]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [itemSel, setItemSel]     = useState(null)
  const [form, setForm]           = useState({ dataInicio: hoje(), dataFim: hoje(), inicio: '08:00', fim: '18:00', motivo: '' })
  const [salvando, setSalvando]   = useState(false)
  const [ok, setOk]               = useState(false)
  const [erro, setErro]           = useState('')

  useEffect(() => {
    supabase.from('itens').select('*').eq('ativo', true).order('id')
      .then(({ data }) => { setItens(data ?? []); setLoading(false) })
  }, [])

  function temConflito(item) {
    const d1 = new Date(form.dataInicio)
    const d2 = new Date(form.dataFim)
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split('T')[0]
      const ocupadas = reservas.filter(r =>
        r.tipo === 'item' && r.item_id === item.id && r.data === dataStr &&
        r.status !== 'cancelado' && !(form.fim <= r.inicio || form.inicio >= r.fim)
      ).length
      if (ocupadas >= item.quantidade) return dataStr
    }
    return null
  }

  function diasPeriodo() {
    const d1 = new Date(form.dataInicio)
    const d2 = new Date(form.dataFim)
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }

  // Próximas reservas por item
  function proximasDoItem(itemId) {
    return reservas
      .filter(r => r.tipo === 'item' && r.item_id === itemId && r.data >= hoje() && r.status !== 'cancelado')
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 3)
  }

  async function salvar() {
    if (!form.motivo.trim()) { setErro('Informe o motivo.'); return }
    if (form.dataFim < form.dataInicio) { setErro('Data de devolução não pode ser antes da retirada.'); return }
    const conf = temConflito(itemSel)
    if (conf) { setErro(`Indisponível no dia ${new Date(conf+'T12:00').toLocaleDateString('pt-BR')}.`); return }

    setErro('')
    setSalvando(true)
    try {
      const d1   = new Date(form.dataInicio)
      const d2   = new Date(form.dataFim)
      const dias = diasPeriodo()
      for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        const dataStr = d.toISOString().split('T')[0]
        await criarReserva({
          tipo: 'item', sala_id: null, item_id: itemSel.id,
          data: dataStr, inicio: form.inicio, fim: form.fim,
          motivo: form.motivo + (dias > 1 ? ` (${form.dataInicio} → ${form.dataFim})` : '')
        })
      }
      setOk(true)
      setTimeout(() => { setOk(false); setItemSel(null); setForm({ dataInicio: hoje(), dataFim: hoje(), inicio: '08:00', fim: '18:00', motivo: '' }) }, 2200)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <p style={{ padding: 32, color: '#A07060' }}>Carregando itens…</p>

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Itens e Equipamentos</h2>
          <p style={s.sub}>{itens.length} itens disponíveis</p>
        </div>
      </div>

      <div style={s.grid}>
        {itens.map(item => {
          const ic      = iconeItem(item.nome)
          const proximas = proximasDoItem(item.id)

          return (
            <div key={item.id} style={{ ...s.card, borderLeftColor: ic.cor }}>
              <div style={s.cardTopo}>
                <div style={{ ...s.iconeBox, background: ic.bg }}>
                  <span style={{ fontSize: 26 }}>{ic.emoji}</span>
                </div>
                {item.quantidade > 1 && (
                  <span style={s.qtdBadge}>🔢 {item.quantidade} unidades</span>
                )}
              </div>

              <div style={s.itemNome}>{item.nome}</div>
              {item.descricao && <div style={s.itemDesc}>{item.descricao}</div>}

              {proximas.length > 0 && (
                <div style={s.agendaDia}>
                  <div style={s.agendaTitulo}>Próximas reservas:</div>
                  {proximas.map(r => (
                    <div key={r.id} style={s.agendaItem}>
                      📅 {new Date(r.data+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                      {' · '}{r.inicio?.slice(0,5)}–{r.fim?.slice(0,5)}
                      <span style={s.agendaMotivo}> · {r.autor?.nome?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => { setItemSel(item); setErro('') }} style={{ ...s.btnCard, background: ic.bg, color: ic.cor }}>
                + Reservar {item.nome}
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {itemSel && (
        <div style={s.overlay} onClick={() => setItemSel(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {ok ? (
              <div style={s.okBox}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ marginBottom: 6 }}>Reserva Confirmada!</h3>
                <p style={{ color: '#888', fontSize: 13 }}>
                  {itemSel.nome}<br/>
                  {form.dataInicio === form.dataFim
                    ? new Date(form.dataInicio+'T12:00').toLocaleDateString('pt-BR')
                    : `${new Date(form.dataInicio+'T12:00').toLocaleDateString('pt-BR')} → ${new Date(form.dataFim+'T12:00').toLocaleDateString('pt-BR')}`
                  }
                </p>
              </div>
            ) : (
              <>
                <div style={s.modalTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...s.iconeBox, background: iconeItem(itemSel.nome).bg, width: 44, height: 44 }}>
                      <span style={{ fontSize: 22 }}>{iconeItem(itemSel.nome).emoji}</span>
                    </div>
                    <div>
                      <h3 style={s.modalTitulo}>{itemSel.nome}</h3>
                      <p style={s.modalSub}>{itemSel.descricao}</p>
                    </div>
                  </div>
                  <button onClick={() => setItemSel(null)} style={s.fechar}>✕</button>
                </div>

                {/* Período */}
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7A5540', marginBottom: 8 }}>📅 Período de uso</p>
                <div style={s.formGrid}>
                  <div style={s.campo}>
                    <label style={s.label}>Retirada</label>
                    <input type="date" value={form.dataInicio} min={hoje()}
                      onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value, dataFim: e.target.value > f.dataFim ? e.target.value : f.dataFim }))}
                      style={s.inputData}/>
                  </div>
                  <div style={s.campo}>
                    <label style={s.label}>Devolução</label>
                    <input type="date" value={form.dataFim} min={form.dataInicio}
                      onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))}
                      style={s.inputData}/>
                  </div>
                </div>

                {diasPeriodo() > 1 && (
                  <div style={{ ...s.diasTag, marginBottom: 12 }}>📆 {diasPeriodo()} dias de uso</div>
                )}

                <p style={{ fontSize: 12, fontWeight: 700, color: '#7A5540', marginBottom: 8 }}>⏰ Horário diário</p>
                <div style={s.formGrid}>
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

                <div style={s.campo}>
                  <label style={s.label}>Motivo / Onde vai usar</label>
                  <input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                    placeholder="Ex: Apresentação Sala Beta" style={s.input}/>
                </div>

                {erro && <p style={s.erro}>{erro}</p>}

                <button onClick={salvar} disabled={salvando} style={s.btn}>
                  {salvando ? 'Salvando…' : `✓ Confirmar${diasPeriodo() > 1 ? ` (${diasPeriodo()} dias)` : ''}`}
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
  wrap:        { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  header:      { marginBottom: 24 },
  titulo:      { fontSize: 20, fontWeight: 700, color: '#3A1F0D', marginBottom: 2 },
  sub:         { fontSize: 13, color: '#A0785A' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
  card:        { background: '#fff', borderRadius: 14, border: '1.5px solid #FFE4CC', borderLeft: '4px solid #FF6B1A', padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(255,107,26,0.06)' },
  cardTopo:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconeBox:    { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtdBadge:    { fontSize: 11, fontWeight: 600, background: '#FFF0E6', color: '#C44D00', padding: '3px 10px', borderRadius: 20 },
  itemNome:    { fontWeight: 700, fontSize: 16, color: '#3A1F0D' },
  itemDesc:    { fontSize: 12, color: '#A07060' },
  agendaDia:   { borderTop: '1px solid #FFE4CC', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  agendaTitulo:{ fontSize: 11, fontWeight: 700, color: '#A07060', marginBottom: 2 },
  agendaItem:  { fontSize: 11, color: '#854F0B', background: '#FFF5E0', borderRadius: 6, padding: '4px 8px' },
  agendaMotivo:{ color: '#C44D00' },
  btnCard:     { marginTop: 4, padding: '9px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 },
  modal:       { background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitulo: { fontSize: 17, fontWeight: 700, margin: 0 },
  modalSub:    { fontSize: 12, color: '#888', marginTop: 3 },
  fechar:      { background: '#FFF0E6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14, flexShrink: 0 },
  formGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 },
  campo:       { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 },
  label:       { fontSize: 12, fontWeight: 600, color: '#7A5540' },
  inputData:   { padding: '9px 12px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  select:      { padding: '9px 12px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  input:       { padding: '10px 14px', border: '1.5px solid #FFD4B8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  diasTag:     { background: '#FFF0E6', color: '#C44D00', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, display: 'inline-block' },
  erro:        { fontSize: 13, color: '#D94000', background: '#FFF0EA', padding: '8px 12px', borderRadius: 8, marginBottom: 10 },
  btn:         { width: '100%', padding: 13, background: 'linear-gradient(135deg,#FF8C3A,#FF6B1A)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,107,26,0.3)' },
  okBox:       { textAlign: 'center', padding: '20px 0' },
}
