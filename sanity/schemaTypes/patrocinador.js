export default {
  name: 'patrocinador',
  title: 'Patrocinador',
  type: 'document',
  fields: [
    { name: 'nome', title: 'Nome', type: 'string' },
    { name: 'logoUrl', title: 'URL do logótipo', type: 'url' },
    { name: 'website', title: 'Website', type: 'url' },
  ],
  preview: {
    select: { title: 'nome' },
  },
}
