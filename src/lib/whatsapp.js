// src/lib/whatsapp.js
// Envia mensagens via Z-API
// Docs: https://developer.z-api.io/

const INSTANCE = process.env.REACT_APP_ZAPI_INSTANCE
const TOKEN    = process.env.REACT_APP_ZAPI_TOKEN
const BASE_URL = `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}`

/**
 * Envia mensagem de texto simples para um número.
 * @param {string} telefone  - formato: 5514999887766  (sem + ou espaços)
 * @param {string} mensagem
 */
async function enviarMensagem(telefone, mensagem) {
  if (!INSTANCE || !TOKEN) {
    console.warn('Z-API não configurada. Mensagem não enviada:', mensagem)
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: telefone, message: mensagem }),
    })
    if (!res.ok) throw new Error(`Z-API status ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Erro ao enviar WhatsApp:', err)
  }
}

// ─── Templates de mensagem ─────────────────────────────────

export async function notificarReservaCriada({ nome, tipo, recurso, data, inicio, fim, motivo, telefone }) {
  const emoji = tipo === 'carro' ? '🚗' : '🏢'
  const msg = [
    `✅ *Reserva Confirmada — ReservaFácil*`,
    ``,
    `Olá, *${nome}*! Sua reserva foi registrada:`,
    ``,
    `${emoji} *${recurso}*`,
    `📅 ${new Date(data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`,
    `⏰ ${inicio} às ${fim}`,
    `📝 ${motivo}`,
    ``,
    `Para cancelar, acesse o app ou responda esta mensagem.`,
  ].join('\n')

  return enviarMensagem(telefone, msg)
}

export async function notificarReservaCancelada({ nome, tipo, recurso, data, inicio, telefone }) {
  const emoji = tipo === 'carro' ? '🚗' : '🏢'
  const msg = [
    `❌ *Reserva Cancelada — ReservaFácil*`,
    ``,
    `Olá, *${nome}*! Sua reserva foi cancelada:`,
    ``,
    `${emoji} *${recurso}*`,
    `📅 ${new Date(data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
    `⏰ ${inicio}`,
    ``,
    `Para fazer uma nova reserva, acesse o app.`,
  ].join('\n')

  return enviarMensagem(telefone, msg)
}

export async function notificarAdminPendente({ adminTelefone, solicitante, tipo, recurso, data, inicio, fim, motivo }) {
  const emoji = tipo === 'carro' ? '🚗' : '🏢'
  const msg = [
    `🔔 *Nova Solicitação de Reserva*`,
    ``,
    `Solicitante: *${solicitante}*`,
    `${emoji} *${recurso}*`,
    `📅 ${new Date(data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
    `⏰ ${inicio} às ${fim}`,
    `📝 ${motivo}`,
    ``,
    `Acesse o painel admin para aprovar ou recusar.`,
  ].join('\n')

  return enviarMensagem(adminTelefone, msg)
}
