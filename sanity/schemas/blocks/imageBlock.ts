export default {
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'localizedString',
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'localizedString',
    },
  ],
  preview: {
    select: {
      media: 'image',
      title: 'alt.en',
    },
    prepare({ media, title }: { media: any; title: string }) {
      return {
        title: title || 'Image',
        media,
      }
    },
  },
}
