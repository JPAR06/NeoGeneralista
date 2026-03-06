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
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'orador' },
  },
}
