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
  if (n.includes('rep ticomia') || n.includes('subsolo'))  return { emoji: '⬇️', bg: '#FAEEDA', cor: '#633806' }
  if (n.includes('viver'))      return { emoji: '🎉', bg: '#FFF0E6', cor: '#C44D00' }
  if (n.includes('formando'))   return { emoji: '📖', bg: '#EAF3DE', cor: '#27500A' }
  if (n.includes('pulo'))       return { emoji: '🐱', bg: '#EEEDFE', cor: '#3C3489' }
  if (n.includes('eternizar'))  return { emoji: '✨', bg: '#E6F1FB', cor: '#185FA5' }
  if (n.includes('formar'))     return { emoji: '🏆', bg: '#FCEBEB', cor: '#791F1F' }
  return { emoji: '🏢', bg: '#FFF0E6', cor: '#C44D00' }
}

export default function Salas() {
  const { profile }            = useAuth()
  const { salas, loading: ls } = useSalas()
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

  function reservasDaSala(salaId) {
    const agora = new Date().toTimeString().slice(0, 5) // "HH:MM"
    return reservas
      .filter(r => {
        if (r.tipo !== 'sala' || r.sala_id !== salaId || r.status === 'cancelado') return false
        if (r.data !== dataSel) return false
        // Se for hoje, esconde reservas que já terminaram
        if (r.data === hoje() && (r.fim || '').slice(0, 5) <= agora) return false
        return true
      })
      .sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''))
  }

  async function salvar() {
    if (!form.motivo.trim()) { setErro('Informe o motivo da reunião.'); return }
    if (form.fim <= form.inicio) { setErro('O horário de fim deve ser após o início.'); return }
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

  if (ls) return (
    <div className="salas-loading">
      <div className="salas-loading-emoji">🏢</div>
      Carregando salas…
    </div>
  )

  return (
    <div className="salas-root">
      {/* Cabeçalho */}
      <div className="salas-header">
        <div>
          <h2 className="salas-titulo">Salas de Reunião</h2>
          <p className="salas-sub">{salas.length} salas disponíveis</p>
        </div>
        <div className="salas-filtro">
          <span className="salas-filtro-label">📅 Data</span>
          <input type="date" value={dataSel} min={hoje()}
            onChange={e => setDataSel(e.target.value)} className="salas-input-data" />
        </div>
      </div>

      {salas.length === 0 && (
        <div className="salas-vazio">
          <div className="salas-vazio-emoji">🏗️</div>
          <p className="salas-vazio-titulo">Nenhuma sala cadastrada</p>
          <p className="salas-vazio-sub">Execute o SQL de atualização no Supabase e recarregue a página.</p>
        </div>
      )}

      {/* Grid de cards */}
      <div className="salas-grid">
        {salas.map(sala => {
          const livre    = !estaOcupada(sala.id)
          const icone    = iconesSala(sala.nome)
          const resHoje  = reservasDaSala(sala.id)

          return (
            <div key={sala.id} onClick={() => setSalaSel(sala)} className={`salas-card ${livre ? '' : 'salas-card-ocupada'}`}>
              {/* Topo do card */}
              <div className="salas-card-topo">
                <div className="salas-icone-box" style={{ background: icone.bg }}>
                  <span style={{ fontSize: 22 }}>{icone.emoji}</span>
                </div>
                <span className={`salas-badge ${livre ? 'salas-badge-ok' : 'salas-badge-err'}`}>
                  {livre ? '● Livre' : '● Ocupada'}
                </span>
              </div>

              {/* Nome */}
              <div className="salas-nome">{sala.nome}</div>
              <div className="salas-cap">👥 {sala.capacidade} pessoas</div>

              {/* Recursos */}
              {sala.recursos?.length > 0 && (
                <div className="salas-recursos">
                  {sala.recursos.map(r => (
                    <span key={r} className="salas-tag">{r}</span>
                  ))}
                </div>
              )}

              {/* Reservas do dia */}
              {resHoje.length > 0 && (
                <div className="salas-agenda">
                  {resHoje.map(r => (
                    <div key={r.id} className="salas-agenda-item">
                      🕐 {(r.inicio||'').slice(0,5)}–{(r.fim||'').slice(0,5)}
                      <span className="salas-agenda-motivo">{r.motivo}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão */}
              <button className="salas-btn-card" style={{ background: icone.bg, color: icone.cor }}
                onClick={e => { e.stopPropagation(); setSalaSel(sala) }}>
                + Reservar esta sala
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {salaSel && (
        <div className="salas-overlay" onClick={() => setSalaSel(null)}>
          <div className="salas-modal" onClick={e => e.stopPropagation()}>
            {ok ? (
              <div className="salas-ok-box">
                <div className="salas-ok-emoji">✅</div>
                <h3 className="salas-ok-titulo">Reserva Confirmada!</h3>
                <p className="salas-ok-sub">
                  {salaSel.nome}<br/>
                  {new Date(dataSel + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}<br/>
                  {form.inicio} às {form.fim}
                </p>
              </div>
            ) : (
              <>
                <div className="salas-modal-top">
                  <div className="salas-modal-info">
                    <div className="salas-icone-box" style={{ background: iconesSala(salaSel.nome).bg, width: 44, height: 44 }}>
                      <span style={{ fontSize: 20 }}>{iconesSala(salaSel.nome).emoji}</span>
                    </div>
                    <div>
                      <h3 className="salas-modal-titulo">{salaSel.nome}</h3>
                      <p className="salas-modal-sub">👥 {salaSel.capacidade} pessoas</p>
                    </div>
                  </div>
                  <button onClick={() => setSalaSel(null)} className="salas-fechar">✕</button>
                </div>

                <div className="salas-form-grid">
                  <div className="salas-campo">
                    <label className="salas-label">Início</label>
                    <select value={form.inicio}
                      onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
                      className="salas-select">
                      {HORARIOS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="salas-campo">
                    <label className="salas-label">Fim</label>
                    <select value={form.fim}
                      onChange={e => setForm(f => ({ ...f, fim: e.target.value }))}
                      className="salas-select">
                      {HORARIOS.filter(h => h > form.inicio).map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="salas-campo">
                  <label className="salas-label">Motivo / Assunto</label>
                  <input value={form.motivo}
                    onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                    placeholder="Ex: Reunião de planejamento"
                    className="salas-input" />
                </div>

                {erro && <p className="salas-erro">{erro}</p>}

                <button onClick={salvar} disabled={salvando} className="salas-btn">
                  {salvando ? 'Salvando…' : '✓ Confirmar Reserva'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .salas-root { max-width:960px; margin:0 auto; padding:24px 16px; animation:fadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .salas-loading { padding:48px; text-align:center; color:#888; animation:fadeIn 0.3s ease; }
        .salas-loading-emoji { font-size:32px; margin-bottom:10px; animation:floatEmoji 3s ease-in-out infinite; }
        @keyframes floatEmoji { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        .salas-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .salas-titulo { font-size:22px; font-weight:800; color:#2C2C2A; margin-bottom:2px; letter-spacing:-0.3px; }
        .salas-sub { font-size:13px; color:#888; }
        .salas-filtro { display:flex; align-items:center; gap:8px; background:#FFFAF7; padding:8px 12px; border-radius:12px; border:1px solid #FFD4B8; }
        .salas-filtro-label { font-size:13px; color:#5F5E5A; }
        .salas-input-data { padding:8px 12px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#fff; color:#3A1F0D; transition:all 0.2s; }
        .salas-input-data:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); }
        .salas-vazio { text-align:center; padding:48px 20px; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); border-radius:16px; border:1px solid #D3D1C7; color:#5F5E5A; animation:fadeIn 0.4s ease; }
        .salas-vazio-emoji { font-size:36px; margin-bottom:10px; }
        .salas-vazio-titulo { font-weight:700; margin-bottom:4px; }
        .salas-vazio-sub { font-size:13px; color:#888; }
        .salas-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:14px; }
        .salas-card { background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); border-radius:16px; border:1px solid rgba(211,209,199,0.6); border-left:4px solid; padding:18px 18px 14px; cursor:pointer; transition:all 0.25s cubic-bezier(0.22,1,0.36,1); display:flex; flex-direction:column; gap:8px; box-shadow:0 2px 12px rgba(0,0,0,0.03); }
        .salas-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.08); border-color:rgba(255,107,26,0.2); }
        .salas-card-ocupada { border-left-color:#F0997B !important; }
        .salas-card-topo { display:flex; justify-content:space-between; align-items:center; }
        .salas-icone-box { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .salas-card:hover .salas-icone-box { transform:scale(1.1) rotate(-4deg); }
        .salas-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
        .salas-badge-ok { background:#EAF3DE; color:#3B6D11; }
        .salas-badge-err { background:#FCEBEB; color:#A32D2D; }
        .salas-nome { font-weight:700; font-size:16px; color:#2C2C2A; }
        .salas-cap { font-size:12px; color:#888; }
        .salas-recursos { display:flex; flex-wrap:wrap; gap:4px; }
        .salas-tag { font-size:11px; background:#F1EFE8; color:#5F5E5A; padding:2px 8px; border-radius:20px; transition:all 0.2s; }
        .salas-card:hover .salas-tag { background:#FFF5EE; color:#FF6B1A; }
        .salas-agenda { border-top:1px solid #F1EFE8; padding-top:8px; display:flex; flex-direction:column; gap:4px; }
        .salas-agenda-item { font-size:11px; color:#854F0B; background:#FAEEDA; border-radius:6px; padding:4px 8px; display:flex; gap:6px; }
        .salas-agenda-motivo { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
        .salas-btn-card { margin-top:4px; padding:8px 0; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; text-align:center; transition:all 0.2s ease; }
        .salas-btn-card:hover { filter:brightness(0.95); transform:translateY(-1px); }
        .salas-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:200; padding:16px; animation:fadeIn 0.2s ease; }
        .salas-modal { background:#fff; border-radius:20px; padding:28px; width:100%; max-width:420px; box-shadow:0 24px 60px rgba(0,0,0,0.2); animation:modalIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(0.96);} to{opacity:1;transform:none;} }
        .salas-ok-box { text-align:center; padding:20px 0; animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .salas-ok-emoji { font-size:48px; margin-bottom:12px; animation:floatEmoji 2s ease-in-out infinite; }
        .salas-ok-titulo { margin-bottom:6px; font-size:18px; }
        .salas-ok-sub { color:#888; font-size:13px; line-height:1.6; }
        .salas-modal-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
        .salas-modal-info { display:flex; align-items:center; gap:12px; }
        .salas-modal-titulo { font-size:17px; font-weight:700; margin:0; }
        .salas-modal-sub { font-size:12px; color:#888; margin-top:3px; }
        .salas-fechar { background:#F1EFE8; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:14px; transition:all 0.2s; display:flex; align-items:center; justify-content:center; }
        .salas-fechar:hover { background:#FCEBEB; color:#A32D2D; transform:rotate(90deg); }
        .salas-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .salas-campo { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
        .salas-label { font-size:12px; font-weight:600; color:#7A5540; }
        .salas-select { padding:10px 12px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#FFFAF7; color:#3A1F0D; transition:all 0.2s; cursor:pointer; }
        .salas-select:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); }
        .salas-input { padding:11px 14px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#FFFAF7; color:#3A1F0D; transition:all 0.2s; }
        .salas-input:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); transform:translateY(-1px); }
        .salas-input::placeholder { color:#D4B8A0; }
        .salas-erro { font-size:13px; color:#E24B4A; margin-bottom:10px; background:#FCEBEB; padding:10px 14px; border-radius:10px; border-left:3px solid #E24B4A; animation:shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
        .salas-btn { width:100%; padding:14px; background:linear-gradient(135deg,#FF8C3A,#FF6B1A); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 4px 16px rgba(255,107,26,0.35); transition:all 0.2s ease; letter-spacing:0.3px; }
        .salas-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 24px rgba(255,107,26,0.45); filter:brightness(1.05); }
        .salas-btn:active:not(:disabled) { transform:scale(0.97); }
        .salas-btn:disabled { opacity:0.7; cursor:not-allowed; }
      `}</style>
    </div>
  )
}