export default {
  name: 'patrocinador',
  title: 'Patrocinador',
  type: 'document',
  fields: [
    { name: 'nome', title: 'Nome', type: 'string' },
    { name: 'logotipo', title: 'Logótipo (upload)', type: 'image', options: { hotspot: true }, description: 'Faz upload directo da imagem' },
    { name: 'logoUrl', title: 'Logótipo (URL externo)', type: 'url', description: 'Alternativa ao upload — usa um dos dois' },
    { name: 'website', title: 'Website', type: 'url' },
  ],
  preview: {
    select: { title: 'nome' },
  },
}
