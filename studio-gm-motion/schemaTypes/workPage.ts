import {defineField, defineType} from 'sanity'
import {mediaSource} from './mediaSource'

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
              name: 'media',
              title: 'Media Source',
              type: 'mediaSource',
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
              mediaType: 'media.mediaType',
              videoName: 'media.video.name',
              image: 'media.image',
              subtitle: 'route',
            },
            prepare({mediaType, videoName, image, subtitle}) {
              return {
                title: mediaType === 'video' ? videoName || 'Video' : 'Image',
                subtitle,
                media: mediaType === 'image' ? image : undefined,
              }
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
