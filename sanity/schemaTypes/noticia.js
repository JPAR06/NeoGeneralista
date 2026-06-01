export default {
  name: 'noticia',
  title: 'Notícias / Blog',
  type: 'document',
  // Grouping with fieldsets makes the form easier to scan in the Studio —
  // identity, conteúdo do site, e o que sai no email ficam em secções
  // distintas.
  fieldsets: [
    { name: 'identity', title: 'Identidade do post', options: { collapsible: false } },
    { name: 'site', title: 'Conteúdo no site', options: { collapsible: false } },
    { name: 'email', title: 'Conteúdo no email de notificação', options: { collapsible: false } },
    { name: 'meta', title: 'Publicação e metadados', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    {
      name: 'titulo',
      title: 'Título',
      type: 'string',
      fieldset: 'identity',
      description:
        'O título principal do post. Aparece no site (cabeçalho do artigo + cards) e no email — onde também é usado como assunto ("Novo artigo: <título>") e é o que se vê em destaque ao abrir.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      fieldset: 'identity',
      description:
        'A parte final do link. Gerada automaticamente a partir do título — só precisas mexer se quiseres mudar a URL.',
      options: { source: 'titulo', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'secao',
      title: 'Secção',
      type: 'string',
      fieldset: 'identity',
      description:
        'Define em que blog o post aparece E quem recebe o email de notificação:\n' +
        '• NeoGeneralista → blog NG + email para todos os subscritores da newsletter Sender.\n' +
        '• AlgoritmoHumano → blog AH + email para utilizadores que deram consentimento de eventos futuros.',
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
    {
      name: 'autor',
      title: 'Autor/a',
      type: 'string',
      fieldset: 'identity',
      description:
        'Aparece como "Por <nome>" por baixo do título no site e no subtítulo do email. Ex: "Ana Sousa".',
    },
    {
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      fieldset: 'identity',
      description:
        'Aparece como etiqueta colorida no topo do email (chip coral no AH, texto coral no NG) e nos cards do blog. Escolhe a que melhor descreve o tom do post.',
      options: {
        list: [
          { title: 'Artigo', value: 'Artigo' },
          { title: 'Notícia', value: 'Notícia' },
          { title: 'Opinião', value: 'Opinião' },
        ],
      },
    },

    {
      name: 'resumo',
      title: 'Resumo curto',
      type: 'text',
      rows: 3,
      fieldset: 'site',
      description:
        'Frase de teaser que aparece nos cards da listagem do blog (homepage, página /blog ou /algoritmo-humano/blog). Mantém abaixo de ~180 caracteres — qualquer coisa maior é cortada nos cards. Se não preencheres a "Introdução para email" abaixo, este texto também é usado lá.',
    },
    {
      name: 'imagem',
      title: 'Imagem de capa',
      type: 'image',
      fieldset: 'site',
      options: { hotspot: true },
      description:
        'Aparece em três sítios: (1) cards do blog, (2) topo do artigo no site, (3) banner no email.\n\n' +
        '⚠️ No email a imagem é cortada automaticamente para banner 2:1 (proporção retangular larga, ex.: 1200×600). Para garantir que ninguém aparece cortado, usa o ponto de hotspot (clica e arrasta o círculo) para indicar a zona mais importante — rostos, logos ou texto.\n\n' +
        'Recomendação: usa imagens horizontais (paisagem) com pelo menos 1200px de largura. Verticais funcionam mas vão ser muito cortadas no email.',
    },
    {
      name: 'conteudo',
      title: 'Conteúdo do artigo',
      type: 'array',
      fieldset: 'site',
      description:
        'O corpo do artigo que aparece no site quando alguém clica "Ler artigo". Suporta texto rico, imagens, listas e links. Não vai no email — o email só leva o teaser e o botão de leitura.',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    },

    {
      name: 'introducaoEmail',
      title: 'Introdução editorial (só email)',
      type: 'text',
      rows: 4,
      fieldset: 'email',
      description:
        'Texto cativante usado APENAS no email de notificação. Pensa nele como "o gancho que faz alguém querer clicar".\n\n' +
        'No email aparece destacado com tipografia editorial (italic, 18px, com barra vertical coral à esquerda). Idealmente entre 1 e 3 frases:\n\n' +
        '• Uma pergunta provocadora — "E se aquilo que recordamos não fosse o conteúdo mas as pessoas?"\n' +
        '• Um excerto forte do artigo\n' +
        '• Uma observação que crie curiosidade — sem dar a resposta\n\n' +
        'Se ficar vazio, o email cai-se no "Resumo curto" do site. Mas para emails com melhor taxa de abertura/clique, vale a pena escrever algo específico aqui.',
    },

    {
      name: 'dataPublicacao',
      title: 'Data de publicação',
      type: 'datetime',
      fieldset: 'meta',
      description:
        'Usada para ordenar os posts no site (mais recente primeiro) e mostrada no artigo. Não controla quando o post fica visível — esse controlo é feito pelo "Publicado" abaixo.',
    },
    {
      name: 'destaque',
      title: 'Destaque na homepage',
      type: 'boolean',
      fieldset: 'meta',
      description:
        'Se ativo, este post aparece em destaque no topo da listagem do blog (card maior, layout especial). Tipicamente só um post de cada vez deve estar em destaque.',
      initialValue: false,
    },
    {
      name: 'publicado',
      title: 'Publicado',
      type: 'boolean',
      fieldset: 'meta',
      description:
        'Liga este toggle quando o post está pronto para o mundo ver. Só posts publicados é que aparecem no site E só posts publicados podem enviar email de notificação (via botão "Notificar subscritores" no menu de ações deste documento).',
      initialValue: false,
    },
    {
      name: 'notificacaoEnviada',
      title: 'Email de notificação já enviado',
      type: 'boolean',
      fieldset: 'meta',
      description:
        'Marca-se automaticamente como ✅ quando o botão "Notificar subscritores" é usado. Serve como travão de segurança — se já estiver ligado, o sistema não envia o mesmo email duas vezes. Só desliga manualmente se realmente quiseres reenviar (ex.: lista de subscritores mudou muito).',
      initialValue: false,
      readOnly: true,
    },
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
