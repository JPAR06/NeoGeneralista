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
    {
      name: 'secao',
      title: 'Secção',
      type: 'string',
      description: 'Define em que blog o post aparece e quem recebe o email de notificação.',
      options: {
        list: [
          { title: 'NeoGeneralista', value: 'neogeneralista' },
          { title: 'AlgoritmoHumano', value: 'algoritmohumano' },
        ],
        layout: 'radio',
      },
      initialValue: 'neogeneralista',
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
    select: { title: 'titulo', subtitle: 'categoria', publicado: 'publicado', secao: 'secao' },
    prepare({ title, subtitle, publicado, secao }) {
      const tag = secao === 'algoritmohumano' ? '[AH]' : '[NG]'
      return {
        title: `${publicado ? '✅' : '📝'} ${tag} ${title}`,
        subtitle: subtitle || 'Sem categoria',
      }
    },
  },
  orderings: [
    { title: 'Data de publicação', name: 'dataDesc', by: [{ field: 'dataPublicacao', direction: 'desc' }] },
  ],
}
