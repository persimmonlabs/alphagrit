export default {
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  fields: [
    {
      name: 'content',
      title: 'Content',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'pt',
          title: 'Portuguese',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'content.en',
    },
    prepare({ title }: { title: any[] }) {
      const text = title?.[0]?.children?.[0]?.text || 'Text Block'
      return {
        title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      }
    },
  },
}
