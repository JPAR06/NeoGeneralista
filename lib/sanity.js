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

export async function getMembrosEquipa() {
  return client.fetch(
    `*[_type == "membroEquipa"] | order(_createdAt asc){
      ...,
      "fotoUrl": foto.asset->url
    }`
  )
}

export async function getMemorosComunidade() {
  return client.fetch(`*[_type == "membroComunidade"] | order(_createdAt asc)`)
}

export async function getEventoProximo() {
  const now = new Date().toISOString()
  return client.fetch(
    `*[_type == "eventoProximo" && (!defined(dataISO) || dataISO > $now)] | order(dataISO asc)[0..1]{
      ...,
      "imagemEventoUrl": imagemEvento.asset->url,
      "fotosPostEventoUrls": fotosPostEvento[].asset->url,
      "videosEventoUrls": videosEvento[].asset->url
    }`,
    { now }
  )
}

// Returns ALL eventoProximo docs (most recent first). Callers split into
// upcoming vs past on the client. One query is enough — dataset stays small.
export async function getEventosAH() {
  return client.fetch(
    `*[_type == "eventoProximo"] | order(coalesce(dataISO, _createdAt) desc){
      ...,
      "imagemEventoUrl": imagemEvento.asset->url,
      "fotosPostEventoUrls": fotosPostEvento[].asset->url,
      "videosEventoUrls": videosEvento[].asset->url
    }`
  )
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

export async function getNoticias(secao = 'neogeneralista') {
  return client.fetch(
    `*[_type == "noticia" && publicado == true && coalesce(secao, "neogeneralista") == $secao]
       | order(dataPublicacao desc) {
         titulo, slug, resumo, autor, categoria, dataPublicacao, destaque, secao,
         "imagemUrl": imagem.asset->url
       }`,
    { secao }
  )
}

export async function getNoticia(slug, secao = 'neogeneralista') {
  return client.fetch(
    `*[_type == "noticia" && slug.current == $slug && publicado == true
       && coalesce(secao, "neogeneralista") == $secao][0] {
         ...,
         "imagemUrl": imagem.asset->url
       }`,
    { slug, secao }
  )
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
