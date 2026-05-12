// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)   // auth.user
  const [profile, setProfile] = useState(null)   // profiles row
  const [loading, setLoading] = useState(true)

  // Carrega perfil do usuário autenticado
  async function carregarProfile(authUser) {
    if (!authUser) { setProfile(null); return }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    // sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      carregarProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    // listener em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      carregarProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function cadastrar({ email, senha, nome, papel = 'funcionario', telefone }) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, papel, telefone } },
    })
    if (error) throw error
  }

  return { user, profile, loading, login, logout, cadastrar }
}
