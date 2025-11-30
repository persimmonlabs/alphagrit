export default {
  name: 'tabsBlock',
  title: 'Tabs Block',
  type: 'object',
  fields: [
    {
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Tab Label',
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
              title: 'label.en',
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      tabs: 'tabs',
    },
    prepare({ tabs }: { tabs: any[] }) {
      return {
        title: `Tabs (${tabs?.length || 0} tabs)`,
      }
    },
  },
}
