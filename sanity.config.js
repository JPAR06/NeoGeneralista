import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'neogeneralista',
  title: 'NeoGeneralista',
  projectId: '8yfcfj67',
  dataset: 'production',
  plugins: [deskTool()],
  schema: { types: schemaTypes },
})
