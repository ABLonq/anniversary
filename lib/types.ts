export type Category = 'tumü' | 'gezdigimiz-yerler' | 'onemli-anilar' | 'romantik-anlar' | 'ilk-kezler' | 'kutlamalar'

export interface MemoryCard {
  id: string
  title: string
  date: string
  meaning: string
  imageUrl: string
  imagePublicId: string
  photos: string[]
  category: Category
  createdAt: string
}
