// src/components/Layout.js
import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const abas = [
  { to: '/',         icon: '🏠', label: 'Início',   exact: true },
  { to: '/salas',    icon: '🏢', label: 'Salas' },
  { to: '/carro',    icon: '🚗', label: 'Gol' },
  { to: '/historico',icon: '📋', label: 'Histórico' },
]

export default function Layout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function sair() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={s.root}>
      {/* ── Top bar ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <span style={s.logo}>📅 ReservaFácil</span>
          <div style={s.headerRight}>
            <span style={s.chip}>{profile?.nome?.split(' ')[0]}</span>
            {profile?.papel === 'admin' && (
              <NavLink to="/admin" style={({ isActive }) => ({
                ...s.adminBtn,
                background: isActive ? '#E1F5EE' : 'transparent',
                color: isActive ? '#0F6E56' : '#5F5E5A',
              })}>
                ⚙️ Admin
              </NavLink>
            )}
            <button onClick={sair} style={s.logoutBtn}>Sair</button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main style={s.main}>
        <Outlet />
      </main>

      {/* ── Bottom nav (PWA / mobile) ── */}
      <nav style={s.bottomNav}>
        {abas.map(a => (
          <NavLink
            key={a.to}
            to={a.to}
            end={a.exact}
            style={({ isActive }) => ({
              ...s.navItem,
              color: isActive ? '#1D9E75' : '#888780',
              borderTop: isActive ? '2px solid #1D9E75' : '2px solid transparent',
            })}
          >
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span style={{ fontSize: 11, marginTop: 2 }}>{a.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f5f5f0',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #E0E0D8',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 16px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontWeight: 700,
    fontSize: 16,
    color: '#2C2C2A',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    fontSize: 12,
    fontWeight: 600,
    background: '#E1F5EE',
    color: '#0F6E56',
    padding: '3px 10px',
    borderRadius: 20,
  },
  adminBtn: {
    fontSize: 13,
    padding: '5px 10px',
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'all .15s',
  },
  logoutBtn: {
    fontSize: 13,
    padding: '5px 10px',
    borderRadius: 8,
    background: 'transparent',
    border: '1px solid #D3D1C7',
    cursor: 'pointer',
    color: '#5F5E5A',
  },
  main: {
    flex: 1,
    paddingBottom: 70, // espaço para bottom nav
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: '#fff',
    borderTop: '1px solid #E0E0D8',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    textDecoration: 'none',
    transition: 'color .15s',
    paddingTop: 4,
  },
}
