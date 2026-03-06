export default {
  name: 'eventoProximo',
  title: 'Próximo Evento',
  type: 'document',
  fields: [
    { name: 'edicao', title: 'Edição', type: 'string', description: 'Ex: AlgoritmoHumano #7' },
    { name: 'tema', title: 'Tema', type: 'string', description: 'Deixar vazio se ainda não definido' },
    { name: 'data', title: 'Data', type: 'string', description: 'Ex: 15 Abr 2025. Deixar vazio se não definida.' },
    { name: 'local', title: 'Local', type: 'string', description: 'Ex: Porto, Portugal' },
  ],
}
