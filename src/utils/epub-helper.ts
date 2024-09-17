import ePub, { type Book, type Rendition } from 'epubjs'

interface Metadata {
  title: string
  creator: string
  description: string
  publisher: string
  isbn: string
}

interface TocItem {
  id: string
  href: string
  label: string
  subitems?: TocItem[]
}

export const loadBook = async (url: string): Promise<Book> => {
  const book = ePub(url)
  await book.ready
  return book
}

export const getMetadata = async (book: Book): Promise<Metadata> => {
  const metadata = await book.loaded.metadata
  return {
    title: metadata.title,
    creator: metadata.creator,
    description: metadata.description,
    publisher: metadata.publisher,
    isbn: metadata.isbn,
  }
}

export const getTableOfContents = async (book: Book): Promise<TocItem[]> => {
  const toc = await book.loaded.navigation
  return toc.toc
}

export const getCurrentLocation = (rendition: Rendition): string => {
  const location = rendition.currentLocation()
  return location.start.cfi
}

export const setCurrentLocation = (rendition: Rendition, cfi: string): void => {
  rendition.display(cfi)
}

export const saveBookmark = (bookId: string, cfi: string): void => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  if (!bookmarks[bookId]) {
    bookmarks[bookId] = []
  }
  bookmarks[bookId].push(cfi)
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
}

export const getBookmarks = (bookId: string): string[] => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  return bookmarks[bookId] || []
}

export const removeBookmark = (bookId: string, cfi: string): void => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  if (bookmarks[bookId]) {
    bookmarks[bookId] = bookmarks[bookId].filter((bookmark) => bookmark !== cfi)
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }
}

export const search = async (book: Book, query: string): Promise<any[]> => {
  const results = await book.search(query)
  return results
}

export const getChapter = async (book: Book, chapterId: string): Promise<any> => {
  const chapter = await book.spine.get(chapterId)
  return chapter
}

export const extractTextContent = async (book: Book, cfi: string): Promise<string> => {
  const range = await book.getRange(cfi)
  return range.toString()
}
