import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'gfxProjectSection',
  title: 'Project Section',
  type: 'object',
  fields: [
    defineField({
      name: 'subheader',
      title: 'Subheader',
      type: 'string',
    }),

    defineField({
      name: 'paragraph',
      title: 'Paragraph',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'media',
      title: 'Media',
      type: 'mediaSource',
    }),
  ],
})
