export default {
  name: 'reserva',
  title: 'Reservas',
  type: 'document',
  fields: [
    { name: 'eventoId', title: 'ID do Evento', type: 'string' },
    { name: 'userId', title: 'ID do Utilizador', type: 'string' },
    { name: 'nome', title: 'Nome', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    {
      name: 'estado',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Confirmado', value: 'confirmado' },
          { title: 'Lista de espera', value: 'lista_espera' },
          { title: 'Cancelado', value: 'cancelado' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'nome',
      subtitle: 'email',
      estado: 'estado',
    },
    prepare({ title, subtitle, estado }) {
      const emoji = estado === 'confirmado' ? '✅' : estado === 'lista_espera' ? '⏳' : '❌'
      return {
        title: `${emoji} ${title}`,
        subtitle,
      }
    },
  },
  orderings: [
    {
      title: 'Data de inscrição',
      name: 'createdAtAsc',
      by: [{ field: '_createdAt', direction: 'asc' }],
    },
  ],
}
