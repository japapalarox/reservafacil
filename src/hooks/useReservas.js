// src/hooks/useReservas.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  notificarReservaCriada,
  notificarReservaCancelada,
  notificarAdminPendente,
} from '../lib/whatsapp'

export function useSalas() {
  const [salas, setSalas]     = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro]       = useState(null)

  useEffect(() => {
    supabase
      .from('salas')
      .select('*')
      .eq('ativa', true)
      .order('id')
      .then(({ data, error }) => {
        console.log('SALAS data:', data)
        console.log('SALAS error:', error)
        if (error) setErro(error.message)
        setSalas(data ?? [])
        setLoading(false)
      })
  }, [])

  return { salas, loading, erro }
}

export function useReservas(profile) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading]   = useState(true)

  const carregar = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    // admin carrega tudo + join com profiles; outros só as próprias
    let q = supabase
      .from('reservas')
      .select(`*, sala:salas(nome,capacidade), item:itens(nome,descricao), autor:profiles(nome,telefone,email)`)
      .order('data', { ascending: false })
      .order('inicio', { ascending: true })

    // Todos veem todas as reservas (para saber quem ocupou sala/carro)
    // Apenas o histórico pessoal filtra por user_id (feito na página)

    const { data, error } = await q
    if (!error) setReservas(data ?? [])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    carregar()

    // Realtime: atualiza automaticamente quando qualquer reserva muda
    const channel = supabase
      .channel('reservas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, carregar)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [carregar])

  // ── Criar reserva ──────────────────────────────────────────
  async function criarReserva({ tipo, sala_id, item_id, data, inicio, fim, motivo }) {
    const payload = {
      tipo,
      sala_id: tipo === 'sala' ? sala_id : null,
      item_id: tipo === 'item' ? item_id : null,
      user_id: profile.id,
      data,
      inicio,
      fim,
      motivo,
      // clientes ficam como pendente; funcionários/admin confirmam direto
      status: profile.papel === 'cliente' ? 'pendente' : 'confirmado',
    }

    const { data: nova, error } = await supabase
      .from('reservas')
      .insert(payload)
      .select(`*, sala:salas(nome), autor:profiles(nome,telefone)`)
      .single()

    if (error) throw error

    // WhatsApp para o usuário
    if (profile.telefone) {
      const recurso = tipo === 'carro' ? 'Gol' : nova.sala?.nome
      await notificarReservaCriada({
        nome: profile.nome,
        tipo,
        recurso,
        data,
        inicio,
        fim,
        motivo,
        telefone: profile.telefone,
      })
    }

    // Se pendente, avisa admins
    if (nova.status === 'pendente') {
      const { data: admins } = await supabase
        .from('profiles')
        .select('telefone')
        .eq('papel', 'admin')
        .not('telefone', 'is', null)

      const recurso = tipo === 'carro' ? 'Gol' : nova.sala?.nome
      for (const admin of admins ?? []) {
        await notificarAdminPendente({
          adminTelefone: admin.telefone,
          solicitante: profile.nome,
          tipo,
          recurso,
          data,
          inicio,
          fim,
          motivo,
        })
      }
    }

    carregar()
    return nova
  }

  // ── Cancelar reserva ───────────────────────────────────────
  async function cancelarReserva(id) {
    const reserva = reservas.find(r => r.id === id)
    const { error } = await supabase
      .from('reservas')
      .update({ status: 'cancelado' })
      .eq('id', id)

    if (error) throw error

    // Notifica usuário dono da reserva
    const telefone = reserva?.autor?.telefone
    if (telefone) {
      const recurso = reserva.tipo === 'carro' ? 'Gol' : reserva.sala?.nome
      await notificarReservaCancelada({
        nome: reserva.autor?.nome,
        tipo: reserva.tipo,
        recurso,
        data: reserva.data,
        inicio: reserva.inicio,
        telefone,
      })
    }

    carregar()
  }

  // ── Aprovar / Recusar (admin) ──────────────────────────────
  async function atualizarStatus(id, status) {
    const { error } = await supabase
      .from('reservas')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    carregar()
  }

  return { reservas, loading, criarReserva, cancelarReserva, atualizarStatus }
}
