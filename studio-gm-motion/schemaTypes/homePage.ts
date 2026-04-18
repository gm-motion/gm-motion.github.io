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
      name: 'gfxWorkSection',
      title: 'GFX Work Section',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'workItem',
          title: 'Work Item',
          fields: [
            defineField({
              name: 'video',
              title: 'GFX Work Video',
              type: 'videoSource',
            }),
            defineField({
              name: 'route',
              title: 'Route',
              type: 'string',
              description: 'Project route (e.g. /gfx-work/{project-name})',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'video.name',
              subtitle: 'route',
            },
          },
        },
      ],
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
