export default {
  name: 'quoteBlock',
  title: 'Quote Block',
  type: 'object',
  fields: [
    {
      name: 'text',
      title: 'Quote Text',
      type: 'localizedText',
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'text.en',
      author: 'author',
    },
    prepare({ title, author }: { title: string; author: string }) {
      return {
        title: title ? `"${title.substring(0, 40)}..."` : 'Quote',
        subtitle: author ? `— ${author}` : undefined,
      }
    },
  },
}
