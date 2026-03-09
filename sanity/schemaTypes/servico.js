export default {
  name: 'servico',
  title: 'Serviço (NeoGeneralista)',
  type: 'document',
  fields: [
    { name: 'titulo', title: 'Título', type: 'string' },
    { name: 'descricao', title: 'Descrição', type: 'text' },
    { name: 'imagemUrl', title: 'URL da imagem', type: 'url' },
    { name: 'href', title: 'Link', type: 'url' },
  ],
  preview: {
    select: { title: 'titulo' },
  },
}
