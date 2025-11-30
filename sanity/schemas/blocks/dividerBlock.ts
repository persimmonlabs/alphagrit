export default {
  name: 'dividerBlock',
  title: 'Divider Block',
  type: 'object',
  fields: [
    {
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Line', value: 'line' },
          { title: 'Dots', value: 'dots' },
          { title: 'Space', value: 'space' },
        ],
      },
      initialValue: 'line',
    },
  ],
  preview: {
    select: {
      style: 'style',
    },
    prepare({ style }: { style: string }) {
      return {
        title: `Divider (${style})`,
      }
    },
  },
}
