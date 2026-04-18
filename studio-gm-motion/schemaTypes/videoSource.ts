import {defineField, defineType} from 'sanity'

type VideoSourceParent = {
  sourceType?: 'external'|'upload'
}

export const videoSource = defineType({
  name: 'videoSource',
  title: 'Video Source',
  type: 'object',
  fields: [
    defineField({
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          {title: 'External URL', value: 'external'},
          {title: 'Upload Video', value: 'upload'},
        ],
        layout: 'radio',
      },
      initialValue: 'external',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'provider',
      title: 'Video Provider',
      type: 'string',
      hidden: ({parent}) =>
          (parent as VideoSourceParent)?.sourceType !== 'external',
      options: {
        list: [
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Direct URL', value: 'direct'},
        ],
      },
    }),

    defineField({
      name: 'url',
      title: 'Video URL / ID',
      type: 'string',
      hidden: ({parent}) =>
          (parent as VideoSourceParent)?.sourceType !== 'external',
    }),

    defineField({
      name: 'videoFile',
      title: 'Uploaded Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) =>
          (parent as VideoSourceParent)?.sourceType !== 'upload',
    }),

    defineField({
      name: 'name',
      title: 'Video Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
  ],
})