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
    <div className="carro-root">
      <h2 className="carro-titulo">Reserva do Gol</h2>

      <div className="carro-card">
        {/* Cabeçalho do carro */}
        <div className="carro-header">
          <div className="carro-icone">🚗</div>
          <div>
            <div className="carro-nome">Volkswagen Gol</div>
            <div className="carro-info">Placa ABC-1234 · Branco · 2020</div>
          </div>
        </div>

        {/* Filtro de data */}
        <div className="carro-filtro">
          <span>📅</span>
          <input type="date" value={dataSel} min={hoje()}
            onChange={e => setDataSel(e.target.value)} className="carro-input-data" />
        </div>

        {/* Reservas do dia */}
        <div className="carro-secao">
          <p className="carro-secao-titulo">Reservas para este dia:</p>
          {reservasDia.length === 0
            ? <p className="carro-vazio">✓ Carro livre neste dia</p>
            : reservasDia.map(r => (
              <div key={r.id} className="carro-ocup-block">
                🕐 {r.inicio.slice(0,5)}–{r.fim.slice(0,5)} · {r.motivo}
              </div>
            ))
          }
        </div>

        {/* Formulário */}
        <div className="carro-form-grid">
          <div className="carro-campo">
            <label className="carro-label">Saída</label>
            <select value={form.inicio}
              onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))}
              className="carro-select">
              {HORARIOS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="carro-campo">
            <label className="carro-label">Retorno</label>
            <select value={form.fim}
              onChange={e => setForm(f => ({ ...f, fim: e.target.value }))}
              className="carro-select">
              {HORARIOS.filter(h => h > form.inicio).map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="carro-campo">
          <label className="carro-label">Destino / Motivo</label>
          <input value={form.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
            placeholder="Ex: Visita ao cliente"
            className="carro-input" />
        </div>

        {ocupado && <p className="carro-aviso">⚠️ Horário conflita com reserva existente.</p>}
        {erro    && <p className="carro-erro">{erro}</p>}
        {ok      && <p className="carro-sucesso">✓ Gol reservado com sucesso!</p>}

        <button onClick={salvar} disabled={salvando || ocupado} className={`carro-btn ${ocupado ? 'carro-btn-disabled' : ''}`}>
          {salvando ? 'Salvando…' : '✓ Reservar Gol'}
        </button>
      </div>

      <style>{`
        .carro-root { max-width:600px; margin:0 auto; padding:24px 16px; animation:fadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .carro-titulo { font-size:22px; font-weight:800; color:#2C2C2A; margin-bottom:20px; letter-spacing:-0.3px; }
        .carro-card { background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:18px; border:1px solid rgba(255,107,26,0.12); padding:28px; box-shadow:0 4px 20px rgba(0,0,0,0.04); }
        .carro-header { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
        .carro-icone { width:56px; height:56px; background:linear-gradient(135deg,#E6F1FB,#D6E8F5); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 4px 12px rgba(24,95,165,0.15); transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .carro-card:hover .carro-icone { transform:scale(1.08) rotate(-4deg); }
        .carro-nome { font-weight:700; font-size:17px; color:#2C2C2A; }
        .carro-info { font-size:12px; color:#888; margin-top:3px; }
        .carro-filtro { display:flex; align-items:center; gap:10px; margin-bottom:20px; padding:12px 14px; background:#FFFAF7; border-radius:12px; border:1px solid #FFD4B8; }
        .carro-input-data { padding:8px 12px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#fff; color:#3A1F0D; transition:all 0.2s; }
        .carro-input-data:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); }
        .carro-secao { margin-bottom:20px; }
        .carro-secao-titulo { font-size:13px; font-weight:600; color:#5F5E5A; margin-bottom:10px; }
        .carro-vazio { font-size:13px; color:#3B6D11; background:#EAF3DE; padding:10px 14px; border-radius:10px; }
        .carro-ocup-block { background:#FCEBEB; border-radius:10px; padding:10px 14px; font-size:13px; color:#A32D2D; margin-bottom:6px; border-left:3px solid #E24B4A; animation:slideIn 0.3s ease; }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px);} to{opacity:1;transform:none;} }
        .carro-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .carro-campo { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
        .carro-label { font-size:12px; font-weight:600; color:#7A5540; }
        .carro-select { padding:10px 12px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#FFFAF7; color:#3A1F0D; transition:all 0.2s; cursor:pointer; }
        .carro-select:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); }
        .carro-input { padding:11px 14px; border:1.5px solid #FFD4B8; border-radius:10px; font-size:14px; font-family:inherit; background:#FFFAF7; color:#3A1F0D; transition:all 0.2s; }
        .carro-input:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.12); transform:translateY(-1px); }
        .carro-input::placeholder { color:#D4B8A0; }
        .carro-aviso { font-size:13px; color:#854F0B; margin-bottom:8px; background:#FAEEDA; padding:10px 14px; border-radius:10px; border-left:3px solid #FFB347; animation:shake 0.4s ease; }
        .carro-erro { font-size:13px; color:#E24B4A; margin-bottom:8px; background:#FCEBEB; padding:10px 14px; border-radius:10px; border-left:3px solid #E24B4A; animation:shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
        .carro-sucesso { font-size:13px; color:#3B6D11; background:#EAF3DE; padding:12px 14px; border-radius:10px; border-left:3px solid #3B6D11; animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from{transform:scale(0.9);opacity:0;} to{transform:scale(1);opacity:1;} }
        .carro-btn { width:100%; padding:14px; background:linear-gradient(135deg,#1D9E75,#16A085); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 4px 16px rgba(29,158,117,0.3); transition:all 0.2s ease; letter-spacing:0.3px; }
        .carro-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 24px rgba(29,158,117,0.4); filter:brightness(1.05); }
        .carro-btn:active:not(:disabled) { transform:scale(0.97); }
        .carro-btn:disabled { opacity:0.5; cursor:not-allowed; filter:grayscale(0.3); }
        .carro-btn-disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
    </div>
  )
}