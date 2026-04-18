import {defineField, defineType} from 'sanity'
import {videoSource} from './videoSource'

export default defineType({
  name: 'workPage',
  title: 'Work Page Schema',
  type: 'document',
  fields: [
    defineField({
      name: 'gfxSubHeader',
      title: 'GFX Subheader',
      type: 'text',
      rows: 1,
    }),
    defineField({
      name: 'photoVideoParagraph',
      title: 'Photography + Video Paragraph',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'gfxWorkMedia',
      title: 'GFX Work Media',
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
      name: 'photoVideoMedia',
      title: 'Photography + Video Media',
      type: 'array',
      of: [
        defineField({
          name: 'mediaItem',
          title: 'Media Item',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              type: 'string',
            }),
            defineField({
              name: 'img',
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'name',
              media: 'img',
            },
          },
        }),
      ],
    }),
  ],
})
