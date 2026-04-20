import {defineField, defineType} from 'sanity'
import {mediaSource} from './mediaSource'
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
        {
          type: 'object',
          name: 'photoVideoItem',
          title: 'Photo / Video Item',
          fields: [
            defineField({
              name: 'media',
              title: 'Media Source',
              type: 'mediaSource',
            }),
          ],
          preview: {
            select: {
              mediaType: 'media.mediaType',
              videoName: 'media.video.name',
              image: 'media.image',
              alt: 'media.alt',
            },
            prepare({mediaType, videoName, image, alt}) {
              return {
                title: mediaType === 'video' ? videoName || 'Video' : alt || 'Image',
                subtitle: mediaType === 'video' ? 'Video' : 'Image',
                media: mediaType === 'image' ? image : undefined,
              }
            },
          },
        },
      ],
    }),
  ],
})
