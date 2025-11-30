export default {
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  fields: [
    {
      name: 'chapterNumber',
      title: 'Chapter Number',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'localizedText',
    },
    {
      name: 'estimatedReadTimeMinutes',
      title: 'Estimated Read Time (minutes)',
      type: 'number',
    },
    {
      name: 'isFreePreview',
      title: 'Free Preview',
      type: 'boolean',
      description: 'Allow this chapter to be read without purchase',
      initialValue: false,
    },
    {
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [{ type: 'section' }],
    },
  ],
  orderings: [
    {
      title: 'Chapter Number',
      name: 'chapterNumberAsc',
      by: [{ field: 'chapterNumber', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      chapterNumber: 'chapterNumber',
      isPublished: 'isPublished',
      isFreePreview: 'isFreePreview',
    },
    prepare({
      title,
      chapterNumber,
      isPublished,
      isFreePreview,
    }: {
      title: string
      chapterNumber: number
      isPublished: boolean
      isFreePreview: boolean
    }) {
      const status = []
      if (!isPublished) status.push('Draft')
      if (isFreePreview) status.push('Free')

      return {
        title: `${chapterNumber}. ${title}`,
        subtitle: status.length > 0 ? status.join(' | ') : 'Published',
      }
    },
  },
}
