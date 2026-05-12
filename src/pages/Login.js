// src/pages/Login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email.trim(), senha)
      navigate('/')
    } catch {
      setErro('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-fundo">
      <div className="login-bolhas">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="login-bolha" style={bolhaEstilo(i)} />
        ))}
      </div>
      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo-circle">
            <img src="/logo.png" alt="Ticomia" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
          </div>
        </div>
        <h1 className="login-titulo">Ticomia</h1>
        <p className="login-sub">Sistema de Reservas</p>
        <form onSubmit={entrar} className="login-form">
          <div className="login-campo">
            <label className="login-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="login-input"/>
          </div>
          <div className="login-campo">
            <label className="login-label">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required className="login-input"/>
          </div>
          {erro && <p className="login-erro">{erro}</p>}
          <button type="submit" disabled={loading} className="login-btn">{loading ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="login-rodape">Não tem conta? Fale com o administrador.</p>
      </div>
      <style>{`
        .login-fundo { min-height:100vh; background:linear-gradient(160deg,#FFF3EC 0%,#FFF9F5 50%,#FFE8D6 100%); display:flex; align-items:center; justify-content:center; padding:16px; position:relative; overflow:hidden; }
        .login-bolhas { position:absolute; inset:0; pointer-events:none; }
        .login-bolha { position:absolute; border-radius:50%; background:radial-gradient(circle at 30% 30%,rgba(255,140,60,0.22),rgba(255,107,26,0.06)); animation:subir linear infinite; }
        @keyframes subir { 0%{transform:translateY(100vh) scale(1); opacity:0;} 10%{opacity:0.15;} 90%{opacity:0.08;} 100%{transform:translateY(-150px) scale(1.15); opacity:0;} }
        .login-card { width:100%; max-width:380px; background:rgba(255,255,255,0.93); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-radius:24px; padding:40px 36px; box-shadow:0 20px 60px rgba(255,107,26,0.15),0 4px 20px rgba(0,0,0,0.06); border:1px solid rgba(255,107,26,0.12); text-align:center; position:relative; z-index:1; animation:cardIn 0.5s cubic-bezier(0.22,1,0.36,1); }
        @keyframes cardIn { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:none; } }
        .login-logo-wrap { margin-bottom:16px; }
        .login-logo-circle { width:100px; height:100px; background:#000; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.25),0 0 0 3px rgba(255,107,26,0.3); animation:pulsar 2.5s ease-in-out infinite; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .login-logo-circle:hover { transform:scale(1.08) rotate(-2deg); }
        @keyframes pulsar { 0%,100%{box-shadow:0 8px 28px rgba(0,0,0,0.25),0 0 0 3px rgba(255,107,26,0.3);} 50%{box-shadow:0 8px 36px rgba(0,0,0,0.3),0 0 0 5px rgba(255,107,26,0.5);} }
        .login-titulo { font-size:30px; font-weight:800; background:linear-gradient(135deg,#FF6B1A,#E85000); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 4px; letter-spacing:-0.5px; }
        .login-sub { font-size:13px; color:#A0785A; margin-bottom:28px; }
        .login-form { display:flex; flex-direction:column; gap:14px; text-align:left; }
        .login-campo { display:flex; flex-direction:column; gap:5px; }
        .login-label { font-size:12px; font-weight:600; color:#7A5540; }
        .login-input { padding:11px 14px; border:1.5px solid #FFD4B8; border-radius:12px; font-size:15px; background:#FFFAF7; color:#3A1F0D; font-family:inherit; transition:border-color 0.2s,box-shadow 0.2s,transform 0.15s; }
        .login-input:focus { outline:none; border-color:#FF6B1A; box-shadow:0 0 0 3px rgba(255,107,26,0.15); transform:translateY(-1px); }
        .login-input::placeholder { color:#D4B8A0; }
        .login-erro { font-size:13px; color:#D94000; text-align:center; background:#FFF0EA; padding:8px 12px; border-radius:8px; animation:shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
        .login-btn { margin-top:6px; padding:13px; background:linear-gradient(135deg,#FF8C3A,#FF6B1A); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 4px 16px rgba(255,107,26,0.4); transition:transform 0.15s,box-shadow 0.15s,filter 0.2s; letter-spacing:0.3px; }
        .login-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 24px rgba(255,107,26,0.5); filter:brightness(1.05); }
        .login-btn:active:not(:disabled) { transform:scale(0.97); }
        .login-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .login-rodape { font-size:12px; color:#B08060; margin-top:20px; }
      `}</style>
    </div>
  )
}

function bolhaEstilo(i) {
  const sizes  = [60,90,50,120,70,45,100,80]
  const lefts  = [5,15,30,45,58,70,82,92]
  const delays = [0,2,4,1,6,3,7,5]
  const durs   = [12,16,10,18,14,11,20,15]
  const size   = sizes[i]
  return { width:size, height:size, left:`${lefts[i]}%`, bottom:`-${size}px`, animationDelay:`${delays[i]}s`, animationDuration:`${durs[i]}s` }
}