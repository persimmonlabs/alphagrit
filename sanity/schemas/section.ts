export default {
  name: 'section',
  title: 'Section',
  type: 'object',
  fields: [
    {
      name: 'heading',
      title: 'Heading',
      type: 'localizedString',
    },
    {
      name: 'sectionType',
      title: 'Section Type',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Two Column', value: 'two-column' },
          { title: 'Full Width', value: 'full-width' },
        ],
      },
      initialValue: 'standard',
    },
    {
      name: 'blocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        { type: 'textBlock' },
        { type: 'imageBlock' },
        { type: 'calloutBlock' },
        { type: 'quoteBlock' },
        { type: 'codeBlock' },
        { type: 'videoBlock' },
        { type: 'dividerBlock' },
        { type: 'accordionBlock' },
        { type: 'tabsBlock' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'heading.en',
      blocks: 'blocks',
    },
    prepare({ title, blocks }: { title: string; blocks: any[] }) {
      return {
        title: title || 'Untitled Section',
        subtitle: `${blocks?.length || 0} blocks`,
      }
    },
  },
}
