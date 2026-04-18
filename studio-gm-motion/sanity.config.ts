import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonActions, singletonTypes} from './structure'

export default defineConfig({
  name: 'default',
  title: 'GM Motion Studio',

  projectId: '12s4nb6j',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (prev, context) =>
      singletonTypes.has(context.schemaType)
        ? prev.filter(({action}) => action && singletonActions.has(action))
        : prev,
  },
})
