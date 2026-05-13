// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Login    from './pages/Login'
import Layout   from './components/Layout'
import Inicio   from './pages/Inicio'
import Salas    from './pages/Salas'
import Carro    from './pages/Carro'
import Historico from './pages/Historico'
import Admin    from './pages/Admin'
import Itens       from './pages/Itens'
import Brindes     from './pages/Brindes'
import Manutencao  from './pages/Manutencao'

function RotaProtegida({ children, apenasAdmin }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={estilos.loading}>Carregando…</div>
  if (!user)   return <Navigate to="/login" replace />
  if (apenasAdmin && profile?.papel !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }>
          <Route index            element={<Inicio />} />
          <Route path="salas"     element={<Salas />} />
          <Route path="carro"     element={<Carro />} />
          <Route path="itens"      element={<Itens />} />
          <Route path="brindes"    element={<Brindes />} />
          <Route path="manutencao" element={<Manutencao />} />
          <Route path="historico" element={<Historico />} />
          <Route path="admin"     element={
            <RotaProtegida apenasAdmin>
              <Admin />
            </RotaProtegida>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const estilos = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    color: '#888',
  },
}
