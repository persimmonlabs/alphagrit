export default {
  name: 'videoBlock',
  title: 'Video Block',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Video Type',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
        ],
      },
      initialValue: 'youtube',
    },
    {
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube or Vimeo video URL',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      type: 'type',
    },
    prepare({ title, type }: { title: string; type: string }) {
      return {
        title: title || 'Video',
        subtitle: type,
      }
    },
  },
}
