import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page Schema',
  type: 'document',
  fields: [
    defineField({
      name: 'headshot',
      title: 'Headshot',
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
    defineField({
      name: 'aboutInfoParagraphs',
      title: 'About Paragraphs',
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
      name: 'timelineItems',
      title: 'Timeline Items',
      type: 'array',
      of: [
        defineField({
          name: 'timelineItem',
          title: 'Timeline Item',
          type: 'object',
          fields: [
            defineField({
              name: 'company',
              title: 'Company',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'Job Title',
              type: 'string',
            }),
            defineField({
              name: 'date',
              title: 'Date',
              type: 'string',
            }),
            defineField({
              name: 'logo',
              title: 'Logo',
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
            defineField({
              name: 'milestones',
              title: 'Milestones',
              type: 'array',
              of: [
                defineField({
                  name: 'milestone',
                  title: 'Milestone',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'date',
                      title: 'Date',
                      type: 'string',
                    }),
                    defineField({
                      name: 'title',
                      title: 'Title',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      rows: 3,
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
                      title: 'title',
                      subtitle: 'date',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'company',
              subtitle: 'title',
              media: 'logo',
            },
          },
        }),
      ],
    }),
  ],
})
