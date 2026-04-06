export default {
  name: 'membroEquipa',
  title: 'Membro da Equipa',
  type: 'document',
  fields: [
    { name: 'iniciais', title: 'Iniciais (avatar)', type: 'string', description: 'Ex: RM' },
    { name: 'corAvatar', title: 'Cor do avatar (hex)', type: 'string', description: 'Ex: #fcc225' },
    { name: 'corTexto', title: 'Cor do texto no avatar (hex)', type: 'string', description: 'Ex: #111' },
    { name: 'nome', title: 'Nome completo', type: 'string' },
    { name: 'funcao', title: 'Função/Cargo', type: 'string' },
    { name: 'bio', title: 'Bio', type: 'text' },
    { name: 'linkedin', title: 'LinkedIn (URL)', type: 'url' },
    { name: 'instagram', title: 'Instagram (ex: @ana.azevedo)', type: 'string' },
    { name: 'ativo', title: 'Membro ativo?', type: 'boolean' },
  ],
  preview: {
    select: { title: 'nome', subtitle: 'funcao' },
  },
}
