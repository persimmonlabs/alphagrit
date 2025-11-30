export default {
  name: 'ebook',
  title: 'E-Book',
  type: 'document',
  fields: [
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
      name: 'description',
      title: 'Description',
      type: 'localizedText',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'price_usd',
      title: 'Price (USD)',
      type: 'number',
      description: 'Price in USD (e.g., 29.99)',
    },
    {
      name: 'price_brl',
      title: 'Price (BRL)',
      type: 'number',
      description: 'Price in BRL (e.g., 149.90)',
    },
    {
      name: 'stripe_price_id_usd',
      title: 'Stripe Price ID (USD)',
      type: 'string',
      description: 'Stripe price ID for USD purchases',
    },
    {
      name: 'stripe_price_id_brl',
      title: 'Stripe Price ID (BRL)',
      type: 'string',
      description: 'Stripe price ID for BRL purchases',
    },
    {
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'chapter' }],
        },
      ],
    },
    {
      name: 'estimatedReadTimeMinutes',
      title: 'Total Estimated Read Time (minutes)',
      type: 'number',
    },
    {
      name: 'themeConfig',
      title: 'Theme Configuration',
      type: 'object',
      fields: [
        {
          name: 'primaryColor',
          title: 'Primary Color',
          type: 'string',
          initialValue: '#f97316',
        },
        {
          name: 'accentColor',
          title: 'Accent Color',
          type: 'string',
          initialValue: '#ef4444',
        },
        {
          name: 'fontFamily',
          title: 'Font Family',
          type: 'string',
          initialValue: 'Inter',
        },
      ],
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      media: 'coverImage',
      status: 'status',
      price: 'price_usd',
    },
    prepare({
      title,
      media,
      status,
      price,
    }: {
      title: string
      media: any
      status: string
      price: number
    }) {
      return {
        title: title || 'Untitled Ebook',
        subtitle: `${status} | $${price || 0}`,
        media,
      }
    },
  },
}
