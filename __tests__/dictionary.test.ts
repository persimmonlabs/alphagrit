import { getDictionary } from '@/lib/dictionary'

describe('Dictionary', () => {
  it('should load English dictionary', async () => {
    const dict = await getDictionary('en')
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.hero).toBeDefined()
    expect(dict.errors).toBeDefined()
  })

  it('should load Portuguese dictionary', async () => {
    const dict = await getDictionary('pt')
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.hero).toBeDefined()
    expect(dict.errors).toBeDefined()
  })

  it('should have all required nav keys', async () => {
    const enDict = await getDictionary('en')
    const ptDict = await getDictionary('pt')

    const requiredNavKeys = ['manifesto', 'products', 'ebooks', 'login', 'blog', 'dashboard']

    requiredNavKeys.forEach((key) => {
      expect(enDict.nav).toHaveProperty(key)
      expect(ptDict.nav).toHaveProperty(key)
    })
  })

  it('should have all error messages translated', async () => {
    const enDict = await getDictionary('en')
    const ptDict = await getDictionary('pt')

    const requiredErrorKeys = ['pageNotFound', 'somethingWrong', 'tryAgain', 'goHome']

    requiredErrorKeys.forEach((key) => {
      expect(enDict.errors).toHaveProperty(key)
      expect(ptDict.errors).toHaveProperty(key)
    })
  })

  it('should default to English for unknown locale', async () => {
    const dict = await getDictionary('fr')
    const enDict = await getDictionary('en')
    expect(dict).toEqual(enDict)
  })
})
