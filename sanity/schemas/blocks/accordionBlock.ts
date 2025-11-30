export default {
  name: 'accordionBlock',
  title: 'Accordion Block',
  type: 'object',
  fields: [
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
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
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({ items }: { items: any[] }) {
      return {
        title: `Accordion (${items?.length || 0} items)`,
      }
    },
  },
}
