// src/pages/Brindes.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const WHATSAPP_NUMEROS = ['5514997487314', '5514991214542']
const ZAPI_INSTANCE    = process.env.REACT_APP_ZAPI_INSTANCE
const ZAPI_TOKEN       = process.env.REACT_APP_ZAPI_TOKEN

const BRINDES = [
  { id: 'cachacinha', nome: 'Cachacinha', emoji: '🥃', descricao: 'Desconta 180ml do estoque de bebida', ml: 180 },
  { id: 'chaveiro',   nome: 'Chaveiro',   emoji: '🔑', descricao: 'Item promocional', ml: 0 },
  { id: 'caneta',     nome: 'Caneta',     emoji: '🖊️', descricao: 'Item promocional', ml: 0 },
]

async function enviarWhatsApp(telefone, mensagem) {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) return
  try {
    await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: telefone, message: mensagem }),
    })
  } catch (e) { console.warn('WhatsApp erro:', e) }
}

export default function Brindes() {
  const { profile } = useAuth()
  const [aba, setAba] = useState('estoque') // 'estoque' | 'pedidos'

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h2 style={s.titulo}>🎁 Brindes</h2>
        <div style={s.abas}>
          <button onClick={() => setAba('estoque')} style={{ ...s.aba, ...(aba === 'estoque' ? s.abaAtiva : {}) }}>
            📦 Estoque
          </button>
          <button onClick={() => setAba('pedidos')} style={{ ...s.aba, ...(aba === 'pedidos' ? s.abaAtiva : {}) }}>
            🛒 Pedidos
          </button>
        </div>
      </div>

      {aba === 'estoque' && <Estoque profile={profile} />}
      {aba === 'pedidos' && <Pedidos profile={profile} />}
    </div>
  )
}

// ─── ESTOQUE ────────────────────────────────────────────────
function Estoque({ profile }) {
  const [estoque, setEstoque]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [editando, setEditando]   = useState(null)
  const [novoVal, setNovoVal]     = useState('')
  const [salvando, setSalvando]   = useState(false)

  const isAdmin = profile?.papel === 'admin'

  async function carregar() {
    const { data } = await supabase.from('estoque').select('*').order('id')
    setEstoque(data ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvarEstoque(id) {
    setSalvando(true)
    await supabase.from('estoque').update({ quantidade: parseFloat(novoVal), updated_at: new Date() }).eq('id', id)
    setEditando(null)
    setNovoVal('')
    carregar()
    setSalvando(false)
  }

  const categorias = {
    bebida:  { label: 'Estoque de Bebidas',     emoji: '🍶', cor: '#C44D00', bg: '#FFF0E6' },
    garrafa: { label: 'Estoque de Garrafinhas', emoji: '🫙', cor: '#065F46', bg: '#ECFDF5' },
    rolha:   { label: 'Estoque de Rolhas',      emoji: '🔩', cor: '#3730A3', bg: '#EEF2FF' },
  }

  if (loading) return <p style={{ color: '#A07060', padding: 20 }}>Carregando estoque…</p>

  return (
    <div style={s.grid3}>
      {estoque.map(item => {
        const cat   = categorias[item.categoria] || categorias.garrafa
        const baixo = item.categoria === 'bebida' ? item.quantidade < 500 : item.quantidade < 10
        return (
          <div key={item.id} style={{ ...s.estoqueCard, borderLeftColor: cat.cor }}>
            <div style={s.estoqueTop}>
              <div style={{ ...s.estoqueIcone, background: cat.bg }}>
                <span style={{ fontSize: 28 }}>{cat.emoji}</span>
              </div>
              {baixo && <span style={s.alertaBaixo}>⚠️ Baixo</span>}
            </div>
            <div style={s.estoqueNome}>{cat.label}</div>
            <div style={{ ...s.estoqueQtd, color: cat.cor }}>
              {item.quantidade} <span style={{ fontSize: 14, fontWeight: 400 }}>{item.unidade}</span>
            </div>

            {isAdmin && (
              editando === item.id ? (
                <div style={s.editRow}>
                  <input type="number" value={novoVal} onChange={e => setNovoVal(e.target.value)}
                    style={s.editInput} placeholder={`Novo valor (${item.unidade})`} autoFocus/>
                  <button onClick={() => salvarEstoque(item.id)} disabled={salvando} style={s.btnSalvar}>✓</button>
                  <button onClick={() => setEditando(null)} style={s.btnCancelar}>✕</button>
                </div>
              ) : (
                <button onClick={() => { setEditando(item.id); setNovoVal(String(item.quantidade)) }}
                  style={{ ...s.btnEditar, background: cat.bg, color: cat.cor }}>
                  ✏️ Editar estoque
                </button>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── PEDIDOS ────────────────────────────────────────────────
function Pedidos({ profile }) {
  const [estoque, setEstoque]     = useState([])
  const [pedidos, setPedidos]     = useState([])
  const [qtds, setQtds]           = useState({ cachacinha: 0, chaveiro: 0, caneta: 0 })
  const [salvando, setSalvando]   = useState(false)
  const [ok, setOk]               = useState(false)
  const [erro, setErro]           = useState('')

  const isAdmin = profile?.papel === 'admin'

  async function carregar() {
    const [{ data: est }, { data: ped }] = await Promise.all([
      supabase.from('estoque').select('*'),
      isAdmin
        ? supabase.from('pedidos_brinde').select('*, autor:profiles(nome)').order('created_at', { ascending: false })
        : supabase.from('pedidos_brinde').select('*, autor:profiles(nome)').eq('user_id', profile.id).order('created_at', { ascending: false })
    ])
    setEstoque(est ?? [])
    setPedidos(ped ?? [])
  }

  useEffect(() => { carregar() }, [])

  const bebidaEstoque = estoque.find(e => e.categoria === 'bebida')
  const mlNecessario  = qtds.cachacinha * 180
  const semEstoque    = mlNecessario > (bebidaEstoque?.quantidade || 0)
  const temAlgo       = Object.values(qtds).some(v => v > 0)

  async function confirmar() {
    if (!temAlgo) { setErro('Selecione pelo menos 1 brinde.'); return }
    if (semEstoque) { setErro(`Estoque insuficiente! Necessário ${mlNecessario}ml, disponível ${bebidaEstoque?.quantidade || 0}ml.`); return }

    setErro('')
    setSalvando(true)
    try {
      const itens = BRINDES
        .filter(b => qtds[b.id] > 0)
        .map(b => ({ nome: b.nome, quantidade: qtds[b.id], ml_total: b.ml * qtds[b.id] }))

      // Salva pedido
      const { error } = await supabase.from('pedidos_brinde').insert({
        user_id: profile.id,
        itens,
        status: 'confirmado',
      })
      if (error) throw error

      // Desconta ml do estoque de bebida
      if (qtds.cachacinha > 0) {
        await supabase.from('estoque')
          .update({ quantidade: (bebidaEstoque.quantidade - mlNecessario), updated_at: new Date() })
          .eq('categoria', 'bebida')
      }

      // Envia WhatsApp
      const resumo = itens.map(i => `• ${i.quantidade}x ${i.nome}${i.ml_total > 0 ? ` (${i.ml_total}ml)` : ''}`).join('\n')
      const msg = [
        `🎁 *Novo Pedido de Brinde — Ticomia*`,
        ``,
        `👤 Solicitante: *${profile.nome}*`,
        ``,
        `Itens solicitados:`,
        resumo,
        ``,
        `📅 ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      ].join('\n')

      for (const num of WHATSAPP_NUMEROS) {
        await enviarWhatsApp(num, msg)
      }

      setOk(true)
      setQtds({ cachacinha: 0, chaveiro: 0, caneta: 0 })
      carregar()
      setTimeout(() => setOk(false), 3000)
    } catch (e) {
      setErro(e.message || 'Erro ao confirmar pedido.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      {ok && (
        <div style={s.okBanner}>
          ✅ Pedido confirmado e enviado via WhatsApp!
        </div>
      )}

      {/* Seleção de brindes */}
      <div style={s.grid3}>
        {BRINDES.map(b => (
          <div key={b.id} style={s.brindeCard}>
            <div style={s.brindeEmoji}>{b.emoji}</div>
            <div style={s.brindeNome}>{b.nome}</div>
            <div style={s.brindeDesc}>{b.descricao}</div>
            {b.id === 'cachacinha' && bebidaEstoque && (
              <div style={s.estoqueInfo}>
                Disponível: <strong>{bebidaEstoque.quantidade}ml</strong>
                {qtds.cachacinha > 0 && <span style={{ color: '#C44D00' }}> → -{qtds.cachacinha * 180}ml</span>}
              </div>
            )}
            <div style={s.qtdRow}>
              <button onClick={() => setQtds(q => ({ ...q, [b.id]: Math.max(0, q[b.id] - 1) }))} style={s.btnQtd}>−</button>
              <span style={s.qtdVal}>{qtds[b.id]}</span>
              <button onClick={() => setQtds(q => ({ ...q, [b.id]: q[b.id] + 1 }))} style={s.btnQtd}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo */}
      {temAlgo && (
        <div style={s.resumoCard}>
          <p style={s.resumoTitulo}>📋 Resumo do pedido</p>
          {BRINDES.filter(b => qtds[b.id] > 0).map(b => (
            <div key={b.id} style={s.resumoItem}>
              <span>{b.emoji} {qtds[b.id]}x {b.nome}</span>
              {b.ml > 0 && <span style={{ color: '#C44D00' }}>−{qtds[b.id] * b.ml}ml</span>}
            </div>
          ))}
          {mlNecessario > 0 && (
            <div style={{ ...s.resumoItem, borderTop: '1px solid #FFE4CC', marginTop: 8, paddingTop: 8 }}>
              <span style={{ fontWeight: 700 }}>Total de bebida:</span>
              <span style={{ color: semEstoque ? '#D94000' : '#C44D00', fontWeight: 700 }}>−{mlNecessario}ml</span>
            </div>
          )}
          {semEstoque && <p style={s.erroEstoque}>⚠️ Estoque insuficiente de bebida!</p>}
        </div>
      )}

      {erro && <p style={s.erro}>{erro}</p>}

      <button onClick={confirmar} disabled={salvando || !temAlgo || semEstoque}
        style={{ ...s.btnConfirmar, opacity: (!temAlgo || semEstoque) ? 0.5 : 1 }}>
        {salvando ? 'Enviando…' : '✓ Confirmar Pedido'}
      </button>

      {/* Histórico de pedidos */}
      {pedidos.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <p style={s.resumoTitulo}>📦 {isAdmin ? 'Todos os pedidos' : 'Meus pedidos'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pedidos.map(p => (
              <div key={p.id} style={s.pedidoItem}>
                <div style={s.pedidoInfo}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {isAdmin && <span style={{ color: '#C44D00' }}>{p.autor?.nome} · </span>}
                    {(p.itens || []).map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                  </div>
                  <div style={{ fontSize: 12, color: '#A07060', marginTop: 2 }}>
                    {new Date(p.created_at).toLocaleDateString('pt-BR')} às {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ ...s.statusBadge, ...(p.status === 'confirmado' ? s.badgeOk : s.badgeErr) }}>
                  {p.status === 'confirmado' ? 'Confirmado' : p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:         { maxWidth: 960, margin: '0 auto', padding: '24px 16px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  titulo:       { fontSize: 22, fontWeight: 800, color: '#3A1F0D' },
  abas:         { display: 'flex', gap: 8, background: '#FFF0E6', padding: 4, borderRadius: 12 },
  aba:          { padding: '8px 16px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#A0785A', fontFamily: 'inherit', transition: 'all .15s' },
  abaAtiva:     { background: '#fff', color: '#C44D00', boxShadow: '0 2px 8px rgba(255,107,26,0.15)' },
  grid3:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 20 },
  estoqueCard:  { background: '#fff', borderRadius: 14, border: '1.5px solid #FFE4CC', borderLeft: '4px solid #FF6B1A', padding: 20, boxShadow: '0 2px 8px rgba(255,107,26,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  estoqueTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  estoqueIcone: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  alertaBaixo:  { fontSize: 11, fontWeight: 700, background: '#FFECEC', color: '#C00000', padding: '3px 10px', borderRadius: 20 },
  estoqueNome:  { fontWeight: 700, fontSize: 15, color: '#3A1F0D' },
  estoqueQtd:   { fontSize: 32, fontWeight: 800, letterSpacing: '-1px' },
  editRow:      { display: 'flex', gap: 6, alignItems: 'center' },
  editInput:    { flex: 1, padding: '8px 10px', border: '1.5px solid #FFD4B8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#FFFAF7' },
  btnSalvar:    { padding: '8px 12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  btnCancelar:  { padding: '8px 12px', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  btnEditar:    { padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' },
  brindeCard:   { background: '#fff', borderRadius: 14, border: '1.5px solid #FFE4CC', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(255,107,26,0.06)', textAlign: 'center' },
  brindeEmoji:  { fontSize: 40 },
  brindeNome:   { fontWeight: 700, fontSize: 16, color: '#3A1F0D' },
  brindeDesc:   { fontSize: 12, color: '#A07060' },
  estoqueInfo:  { fontSize: 12, color: '#7A5540', background: '#FFF5EE', padding: '4px 10px', borderRadius: 8 },
  qtdRow:       { display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 },
  btnQtd:       { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#FFF0E6', color: '#C44D00', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' },
  qtdVal:       { fontSize: 22, fontWeight: 800, color: '#3A1F0D', minWidth: 32, textAlign: 'center' },
  resumoCard:   { background: '#fff', borderRadius: 14, border: '1.5px solid #FFE4CC', padding: 18, marginBottom: 16 },
  resumoTitulo: { fontWeight: 700, fontSize: 15, color: '#7A5540', marginBottom: 12 },
  resumoItem:   { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#3A1F0D', padding: '4px 0' },
  erroEstoque:  { fontSize: 13, color: '#D94000', background: '#FFF0EA', padding: '8px 12px', borderRadius: 8, marginTop: 8 },
  erro:         { fontSize: 13, color: '#D94000', background: '#FFF0EA', padding: '10px 14px', borderRadius: 10, marginBottom: 14 },
  btnConfirmar: { width: '100%', padding: 14, background: 'linear-gradient(135deg,#FF8C3A,#FF6B1A)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,107,26,0.3)', transition: 'all .15s' },
  okBanner:     { background: '#EAF3DE', color: '#3B6D11', fontWeight: 700, padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'center' },
  pedidoItem:   { background: '#fff', borderRadius: 12, border: '1.5px solid #FFE4CC', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  pedidoInfo:   { flex: 1 },
  statusBadge:  { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0 },
  badgeOk:      { background: '#EAF3DE', color: '#3B6D11' },
  badgeErr:     { background: '#FCEBEB', color: '#A32D2D' },
}
