import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'headerFooter',
  title: 'Header and Footer Schema',
  type: 'document',
  fields: [
    defineField({
      name: 'footerHeader',
      title: 'Footer Header',
      type: 'text',
      rows: 1,
    }),
    defineField({
      name: 'footerParagraph',
      title: 'Footer Paragraph',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'logoLight',
      title: 'Logo (White)',
      type: 'image',
      description:
          '.svg preferred. Should be a white logo on transparent background for best results. Image should ideally be vertically and horizontally centered in a 1:1 aspect ratio image.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'logoDark',
      title: 'Logo (Black)',
      type: 'image',
      description:
          '.svg preferred. Should be a black logo on transparent background for best results. Image should ideally be vertically and horizontally centered in a 1:1 aspect ratio image.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'footerSocials',
      title: 'Footer Socials',
      type: 'array',
      of: [
        defineField({
          name: 'social',
          title: 'Social',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
            }),
            defineField({
              name: 'socialLink',
              title: 'Link',
              type: 'url',
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description:
                  '.svg preferred. Should be a white logo on transparent background for best results. Image should ideally be vertically and horizontally centered in a 1:1 aspect ratio image.',
              options: {hotspot: true},
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
              title: 'label',
              media: 'icon',
            },
          },
        }),
      ],
    }),
  ],
})