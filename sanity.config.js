import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'neogeneralista',
  title: 'NeoGeneralista',
  projectId: '8yfcfj67',
  dataset: 'production',
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.documentTypeListItem('eventoProximo').title('Eventos'),
            S.listItem()
              .title('Reservas por Evento')
              .icon(() => '👥')
              .child(
                S.documentTypeList('eventoProximo')
                  .title('Escolhe um Evento')
                  .child((eventoId) =>
                    S.documentList()
                      .title('Inscritos')
                      .filter('_type == "reserva" && eventoId == $eventoId')
                      .params({ eventoId })
                  )
              ),
            S.documentTypeListItem('reserva').title('Todas as Reservas'),
            S.divider(),
            S.documentTypeListItem('conversa').title('Conversas'),
            S.documentTypeListItem('membroEquipa').title('Equipa'),
            S.documentTypeListItem('membroComunidade').title('Comunidade'),
            S.documentTypeListItem('patrocinador').title('Patrocinadores'),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
})
