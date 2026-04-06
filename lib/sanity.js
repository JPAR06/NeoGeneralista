import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export const writeClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function getConversas() {
  return client.fetch(`*[_type == "conversa"] | order(numero desc)`)
}

export async function getConversa(numero) {
  return client.fetch(`*[_type == "conversa" && numero == $numero][0]`, { numero: Number(numero) })
}

export async function getMembrosEquipa() {
  return client.fetch(`*[_type == "membroEquipa"] | order(_createdAt asc)`)
}

export async function getMemorosComunidade() {
  return client.fetch(`*[_type == "membroComunidade"] | order(_createdAt asc)`)
}

export async function getEventoProximo() {
  return client.fetch(`*[_type == "eventoProximo"][0]{
    ...,
    "imagemEventoUrl": imagemEvento.asset->url,
    "fotosPostEventoUrls": fotosPostEvento[].asset->url
  }`)
}

export async function getPatrocinadores() {
  return client.fetch(`*[_type == "patrocinador"] | order(_createdAt asc) { nome, website, logoUrl, "logotipoUrl": logotipo.asset->url }`)
}

export async function getConfiguracoes() {
  return client.fetch(`*[_type == "configuracoes"][0]`)
}

export async function getServicos() {
  return client.fetch(`*[_type == "servico"] | order(_createdAt asc)`)
}

export async function getLogosClientes() {
  return client.fetch(`*[_type == "logoCliente"] | order(_createdAt asc)`)
}

export async function getReservaDoUtilizador(eventoId, userId) {
  return client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]`,
    { eventoId, userId }
  )
}

export async function getContagemReservasConfirmadas(eventoId) {
  return client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  )
}
