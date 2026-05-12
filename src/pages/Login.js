// src/pages/Login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email.trim(), senha)
      navigate('/')
    } catch (err) {
      setErro('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.fundo}>
      <div style={s.card}>
        <div style={s.icone}>📅</div>
        <h1 style={s.titulo}>ReservaFácil</h1>
        <p style={s.sub}>Salas e veículos em um clique</p>

        <form onSubmit={entrar} style={s.form}>
          <div style={s.campo}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={s.input}
            />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={s.input}
            />
          </div>

          {erro && <p style={s.erro}>{erro}</p>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p style={s.rodape}>
          Não tem conta? Fale com o administrador do sistema.
        </p>
      </div>
    </div>
  )
}

const s = {
  fundo: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #E1F5EE 0%, #f5f5f0 50%, #E6F1FB 100%)',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#fff',
    borderRadius: 20,
    padding: '36px 32px',
    boxShadow: '0 8px 40px rgba(0,0,0,.1)',
    textAlign: 'center',
  },
  icone: { fontSize: 40, marginBottom: 8 },
  titulo: { fontSize: 24, fontWeight: 700, color: '#2C2C2A', margin: 0 },
  sub:    { fontSize: 13, color: '#888780', marginTop: 4, marginBottom: 28 },
  form:   { display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' },
  campo:  { display: 'flex', flexDirection: 'column', gap: 5 },
  label:  { fontSize: 12, fontWeight: 600, color: '#5F5E5A' },
  input:  {
    padding: '10px 14px',
    border: '1px solid #D3D1C7',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit',
  },
  erro: { fontSize: 13, color: '#E24B4A', textAlign: 'center', margin: 0 },
  btn: {
    marginTop: 6,
    padding: '13px',
    background: '#1D9E75',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  rodape: { fontSize: 12, color: '#888780', marginTop: 20 },
}
