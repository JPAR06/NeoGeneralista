export default {
  name: 'noticia',
  title: 'Notícias / Blog',
  type: 'document',
  fields: [
    { name: 'titulo', title: 'Título', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'titulo', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    { name: 'resumo', title: 'Resumo', type: 'text', rows: 3, description: 'Resumo curto para cards e email' },
    {
      name: 'conteudo',
      title: 'Conteúdo',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    },
    {
      name: 'imagem',
      title: 'Imagem de capa',
      type: 'image',
      options: { hotspot: true },
    },
    { name: 'autor', title: 'Autor', type: 'string' },
    {
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Artigo', value: 'Artigo' },
          { title: 'Notícia', value: 'Notícia' },
          { title: 'Opinião', value: 'Opinião' },
        ],
      },
    },
    { name: 'dataPublicacao', title: 'Data de publicação', type: 'datetime' },
    { name: 'destaque', title: 'Destaque', type: 'boolean', initialValue: false },
    { name: 'publicado', title: 'Publicado', type: 'boolean', initialValue: false },
    { name: 'notificacaoEnviada', title: 'Notificação enviada', type: 'boolean', initialValue: false, readOnly: true },
  ],
  preview: {
    select: { title: 'titulo', subtitle: 'categoria', publicado: 'publicado' },
    prepare({ title, subtitle, publicado }) {
      return {
        title: `${publicado ? '✅' : '📝'} ${title}`,
        subtitle: subtitle || 'Sem categoria',
      }
    },
  },
  orderings: [
    { title: 'Data de publicação', name: 'dataDesc', by: [{ field: 'dataPublicacao', direction: 'desc' }] },
  ],
}
