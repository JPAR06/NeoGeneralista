export default {
  name: 'configuracoes',
  title: 'Configurações do Site',
  type: 'document',
  fields: [
    { name: 'totalEdicoes', title: 'Total de edições', type: 'number' },
    { name: 'totalParticipantes', title: 'Total de participantes', type: 'string', description: 'Ex: +100' },
    { name: 'cidade', title: 'Cidade', type: 'string', description: 'Ex: Porto' },
    { name: 'manifesto', title: 'Frase do manifesto', type: 'text' },
    {
      name: 'maisNaComunidade',
      title: 'Número do "+X" na comunidade',
      type: 'number',
      description: 'Ex: 88 aparece como "+88"',
    },
  ],
}
