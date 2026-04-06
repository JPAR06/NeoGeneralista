export default {
  name: 'membroComunidade',
  title: 'Membro da Comunidade',
  type: 'document',
  fields: [
    { name: 'nome', title: 'Nome', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'iniciais', title: 'Iniciais', type: 'string' },
    { name: 'cor', title: 'Cor de fundo (hex)', type: 'string' },
  ],
  preview: {
    select: { title: 'nome', subtitle: 'email' },
  },
  orderings: [
    { title: 'Nome', name: 'nomeAsc', by: [{ field: 'nome', direction: 'asc' }] },
  ],
}
