// Document types
import ebook from './ebook'
import chapter from './chapter'

// Object types
import section from './section'
import localizedString from './objects/localizedString'
import localizedText from './objects/localizedText'

// Block types
import textBlock from './blocks/textBlock'
import imageBlock from './blocks/imageBlock'
import calloutBlock from './blocks/calloutBlock'
import quoteBlock from './blocks/quoteBlock'
import codeBlock from './blocks/codeBlock'
import videoBlock from './blocks/videoBlock'
import dividerBlock from './blocks/dividerBlock'
import accordionBlock from './blocks/accordionBlock'
import tabsBlock from './blocks/tabsBlock'

export const schemaTypes = [
  // Documents
  ebook,
  chapter,
  // Objects
  section,
  localizedString,
  localizedText,
  // Blocks
  textBlock,
  imageBlock,
  calloutBlock,
  quoteBlock,
  codeBlock,
  videoBlock,
  dividerBlock,
  accordionBlock,
  tabsBlock,
]
