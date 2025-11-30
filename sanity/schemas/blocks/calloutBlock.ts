export default {
  name: 'calloutBlock',
  title: 'Callout Block',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Tip', value: 'tip' },
          { title: 'Note', value: 'note' },
        ],
      },
      initialValue: 'info',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localizedText',
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      type: 'type',
    },
    prepare({ title, type }: { title: string; type: string }) {
      return {
        title: title || `${type?.charAt(0).toUpperCase()}${type?.slice(1)} Callout`,
        subtitle: type,
      }
    },
  },
}
