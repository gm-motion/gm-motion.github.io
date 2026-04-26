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
      name: 'banner',
      title: 'Banner Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    }),

    defineField({
      name: 'paragraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [{type: 'text'}],
    }),

    defineField({
      name: 'columns',
      title: 'Columns',
      description: 'How many columns should the media fill across? Ideal values are 1 - 3.',
      type: 'number',
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().min(1),
    }),

    defineField({
      name: 'mediaHeader',
      title: 'Media Items Title',
      type: 'string',
    }),

    defineField({
      name: 'mediaItems',
      title: 'Images / Videos',
      type: 'array',
      of: [{type: 'mediaSource'}],
    }),
  ],

  preview: {
    select: {
      title: 'subheader',
      media: 'banner',
      mediaItems: 'mediaItems',
    },
    prepare({title, media, mediaItems}) {
      return {
        title: title || 'Untitled section',
        subtitle: `${mediaItems?.length || 0} media item(s)`,
        media,
      }
    },
  },
})
