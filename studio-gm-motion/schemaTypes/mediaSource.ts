import {defineField, defineType} from 'sanity'

type mediaSourceParent = {
  mediaType?: 'video' | 'image'
}

export const mediaSource = defineType({
  name: 'mediaSource',
  title: 'Media Source',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Video', value: 'video'},
          {title: 'Image', value: 'image'},
        ],
        layout: 'radio',
      },
      initialValue: 'video',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'video',
      title: 'Video',
      type: 'videoSource',
      hidden: ({parent}) => (parent as mediaSourceParent)?.mediaType !== 'video',
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({parent}) => (parent as mediaSourceParent)?.mediaType !== 'image',
    }),

    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      hidden: ({parent}) => (parent as mediaSourceParent)?.mediaType !== 'image',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      videoName: 'video.name',
      image: 'image',
    },
    prepare({mediaType, videoName, image}) {
      return {
        title: mediaType === 'video' ? videoName || 'Video' : 'Image',
        subtitle: mediaType,
        media: mediaType === 'image' ? image : undefined,
      }
    },
  },
})
