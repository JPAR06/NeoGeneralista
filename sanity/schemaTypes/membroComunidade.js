export default {
  name: 'membroComunidade',
  title: 'Membro da Comunidade',
  type: 'document',
  fields: [
    { name: 'iniciais', title: 'Iniciais', type: 'string', description: 'Ex: AF' },
    { name: 'cor', title: 'Cor de fundo (hex)', type: 'string', description: 'Ex: #fcc225' },
  ],
  preview: {
    select: { title: 'iniciais', subtitle: 'cor' },
  },
}
