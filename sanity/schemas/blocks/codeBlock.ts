export default {
  name: 'codeBlock',
  title: 'Code Block',
  type: 'object',
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'text',
      rows: 10,
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'Python', value: 'python' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'JSON', value: 'json' },
          { title: 'Bash', value: 'bash' },
          { title: 'SQL', value: 'sql' },
        ],
      },
    },
    {
      name: 'filename',
      title: 'Filename',
      type: 'string',
    },
  ],
  preview: {
    select: {
      filename: 'filename',
      language: 'language',
    },
    prepare({ filename, language }: { filename: string; language: string }) {
      return {
        title: filename || 'Code Block',
        subtitle: language,
      }
    },
  },
}
