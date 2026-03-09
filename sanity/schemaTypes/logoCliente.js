export default {
  name: 'logoCliente',
  title: 'Logo de Cliente',
  type: 'document',
  fields: [
    { name: 'nome', title: 'Nome da empresa', type: 'string' },
    { name: 'logoUrl', title: 'URL do logótipo', type: 'url' },
  ],
  preview: {
    select: { title: 'nome' },
  },
}
