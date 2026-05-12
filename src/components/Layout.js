// src/components/Layout.js
import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const abas = [
  { to: '/',          icon: '🏠', label: 'Início' },
  { to: '/salas',     icon: '🏢', label: 'Salas' },
  { to: '/carro',     icon: '🚗', label: 'Gol' },
  { to: '/historico', icon: '📋', label: 'Histórico' },
]

export default function Layout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function sair() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                <path d="M10 13h16M18 13v10M13 23h10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="brand-name">Ticomia</span>
          </div>

          <div className="header-right">
            <span className="user-chip">
              {profile?.nome?.split(' ')[0]}
            </span>
            {profile?.papel === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? 'admin-btn active' : 'admin-btn'
                }
              >
                <span className="admin-icon">⚙️</span>
                <span className="admin-label">Admin</span>
              </NavLink>
            )}
            <button onClick={sair} className="logout-btn">
              <span>Sair</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>

      <nav className="bottom-nav">
        {abas.map((a) => {
          const isActive = location.pathname === a.to ||
            (a.to !== '/' && location.pathname.startsWith(a.to))
          return (
            <NavLink
              key={a.to}
              to={a.to}
              end={a.to === '/'}
              className={isActive ? 'nav-item active' : 'nav-item'}
            >
              <div className="nav-icon-wrap">
                <span className="nav-icon">{a.icon}</span>
                {isActive && <span className="nav-dot" />}
              </div>
              <span className="nav-label">{a.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <style>{`/* === Glassmorphism + animações === */
        .layout-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(165deg, #FFF5EE 0%, #FFFAF7 40%, #FFFFFF 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* HEADER */
        .layout-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border-bottom: 1px solid rgba(255, 107, 26, 0.08);
          box-shadow: 0 1px 12px rgba(255, 107, 26, 0.04);
        }
        .header-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 0 20px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #FF8C3A, #FF6B1A);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(255, 107, 26, 0.35);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .brand:hover .brand-icon {
          transform: scale(1.08) rotate(-4deg);
        }
        .brand-name {
          font-weight: 800;
          font-size: 18px;
          background: linear-gradient(135deg, #FF6B1A, #E85000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.4px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-chip {
          font-size: 12.5px;
          font-weight: 700;
          background: linear-gradient(135deg, #FF8C3A, #FF6B1A);
          color: #fff;
          padding: 4px 14px;
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(255, 107, 26, 0.3);
          letter-spacing: 0.2px;
          transition: transform 0.2s ease;
        }
        .user-chip:hover {
          transform: translateY(-1px);
        }

        .admin-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #A0785A;
          background: transparent;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }
        .admin-btn:hover {
          background: rgba(255, 107, 26, 0.06);
          color: #FF6B1A;
        }
        .admin-btn.active {
          background: rgba(255, 107, 26, 0.10);
          color: #FF6B1A;
          border-color: rgba(255, 107, 26, 0.15);
          box-shadow: 0 2px 8px rgba(255, 107, 26, 0.08);
        }
        .admin-label {
          display: none;
        }
        @media (min-width: 420px) {
          .admin-label { display: inline; }
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 10px;
          background: transparent;
          border: 1.5px solid #FFD4B8;
          cursor: pointer;
          color: #A0785A;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          background: #FFF0E6;
          border-color: #FFB88C;
          color: #E85000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 26, 0.12);
        }
        .logout-btn:active {
          transform: scale(0.96);
        }

        /* MAIN */
        .layout-main {
          flex: 1;
          padding-bottom: 80px;
        }
        .main-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 20px;
          animation: fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* BOTTOM NAV */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-top: 1px solid rgba(255, 107, 26, 0.08);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          justify-content: space-around;
          align-items: stretch;
          z-index: 100;
          padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
        }
        .nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-decoration: none;
          color: #B08060;
          transition: color 0.25s ease;
          padding-top: 4px;
          gap: 3px;
        }
        .nav-item:hover {
          color: #FF8C3A;
        }
        .nav-item.active {
          color: #FF6B1A;
        }
        .nav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 32px;
        }
        .nav-icon {
          font-size: 22px;
          line-height: 1;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: grayscale(0.25);
        }
        .nav-item:hover .nav-icon {
          transform: translateY(-3px) scale(1.15);
          filter: grayscale(0);
        }
        .nav-item.active .nav-icon {
          transform: translateY(-2px) scale(1.12);
          filter: grayscale(0);
        }
        .nav-dot {
          position: absolute;
          bottom: -2px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FF6B1A;
          box-shadow: 0 0 8px rgba(255, 107, 26, 0.5);
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2px;
          transition: opacity 0.2s;
        }
      `}</style>
    </div>
  )
}