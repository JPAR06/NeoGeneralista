export default {
  name: 'conversa',
  title: 'Conversa',
  type: 'document',
  fields: [
    { name: 'numero', title: 'Número da edição', type: 'number' },
    { name: 'tema', title: 'Tema', type: 'string' },
    { name: 'orador', title: 'Orador', type: 'string' },
    { name: 'titulo', title: 'Título', type: 'string' },
    { name: 'coracoes', title: 'Corações', type: 'number' },
    {
      name: 'cor',
      title: 'Cor (gradiente CSS)',
      type: 'string',
      description: 'Ex: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    { name: 'data', title: 'Data', type: 'string', description: 'Ex: 8 Mar 2025' },
    { name: 'duracao', title: 'Duração', type: 'string', description: 'Ex: 22 min' },
    { name: 'descricao', title: 'Descrição', type: 'text', description: 'Resumo da conversa (aparece na página de detalhe)' },
    { name: 'videoUrl', title: 'URL do Vídeo', type: 'url', description: 'YouTube ou Vimeo embed URL (ex: https://www.youtube.com/embed/xxx)' },
    {
      name: 'pontos',
      title: 'Pontos-chave',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Lista de ideias principais da conversa',
    },
    { name: 'oradorBio', title: 'Bio do Orador', type: 'text', description: 'Breve apresentação do orador' },
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'orador' },
  },
}
