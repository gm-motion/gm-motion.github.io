import {defineField, defineType} from 'sanity'
import gfxProjectSection from './gfxProjectSection'

export default defineType({
  name: 'gfxProject',
  title: 'GFX Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheader',
      title: 'Subheader',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
          'The designated route for the project, e.g. "/gfx-work/{slug}.',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'thumbnail',
      title: 'GFX Work Thumbnail',
      description:
          'This thumbnail will be displayed on the /gfx-work page and on the /home page',
      type: 'videoSource',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [{type: 'gfxProjectSection'}],
    }),
  ],
})
