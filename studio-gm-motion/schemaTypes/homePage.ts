import {defineField, defineType} from 'sanity'
import {videoSource} from './videoSource'

export default defineType({
  name: 'homePage',
  title: 'Home Page Schema',
  type: 'document',
  fields: [
    defineField({
      name: 'titleVideo',
      title: 'Title Page Video',
      type: 'videoSource',
    }),
    defineField({
      name: 'headQuote',
      title: 'Head Quote',
      type: 'text',
      rows: 1,
    }),
    defineField({
      name: 'headParagraphs',
      title: 'Head Paragraphs',
      type: 'array',
      of: [
        defineField({
          name: 'paragraph',
          title: 'Paragraph',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
            }),
          ],
          preview: {
            select: {
              title: 'text',
            },
            prepare({title}) {
              return {
                title: title || 'Empty paragraph',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'videoStack',
      title: 'Video Stack Section',
      type: 'array',
      of: [{type: 'videoSource'}],
    }),
    defineField({
      name: 'partneredClientsSection',
      title: 'Partnered Clients Section',
      type: 'array',
      of: [
        defineField({
          name: 'clientItem',
          title: 'Client Item',
          type: 'object',
          fields: [
            defineField({
              name: 'client',
              title: 'Client',
              type: 'string',
            }),
            defineField({
              name: 'img',
              title: 'Image',
              type: 'image',
              description:
                  '.webp preferred. Should be a white logo on transparent background for best results.',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'client',
              media: 'img',
            },
          },
        }),
      ],
    }),
  ],
})
