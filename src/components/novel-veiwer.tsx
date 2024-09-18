import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { Book, Rendition, NavItem, Location } from 'epubjs'
import { loadBook } from '@/utils/epub-helper'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, Loader2, MenuIcon, PlayIcon, XIcon } from 'lucide-react'
import Layout from '@/layout/layout'
import { useTheme } from './theme-provider'

function Loading() {
  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='text-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto' />
        <p className='mt-4 text-lg font-semibold'>Loading...</p>
      </div>
    </div>
  )
}

function NovelViewer() {
  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const { filename } = useParams()
  const viewerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [toc, setToc] = useState<NavItem[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>('')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  // const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  // Load the book
  useEffect(() => {
    async function loadEpub() {
      if (!filename) return
      setIsLoading(true)
      try {
        const newBook = await loadBook(`/novels/${filename}`)
        setBook(newBook)
        const navigation = await newBook.loaded.navigation
        if (navigation?.toc) {
          setToc(navigation.toc)
          const firstContentChapter = findFirstContentChapter(navigation.toc)
          if (firstContentChapter) {
            setCurrentChapter(firstContentChapter)
          } else if (navigation.toc.length > 0) {
            setCurrentChapter(navigation.toc[0].href)
          }
        }
      } catch (error) {
        console.error('Error loading book:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpub()

    return () => {
      if (book) {
        book.destroy()
      }
    }
  }, [filename])

  // Create rendition when book is loaded and viewerRef is available
  useEffect(() => {
    if (book && viewerRef.current) {
      const newRendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        flow: 'scrolled-doc',
        resizeOnOrientationChange: true,
        stylesheet: '/epub.css',
      })

      setRendition(newRendition)

      return () => {
        newRendition.destroy()
      }
    }
  }, [book])

  // Handle theme changes and initial display
  useEffect(() => {
    if (rendition) {
      rendition.themes.select(theme)

      const savedLocation = localStorage.getItem(`bookLocation_${filename}`)
      if (savedLocation) {
        rendition.display(savedLocation)
      } else {
        // Find the first content chapter
        const firstContentChapter = findFirstContentChapter(toc)
        if (firstContentChapter) {
          rendition.display(firstContentChapter)
          setCurrentChapter(firstContentChapter)
        } else {
          rendition.display()
        }
      }

      rendition.on('relocated', (location: Location) => {
        if (location?.start) {
          const locationString = location.start.cfi ? location.start.cfi.toString() : ''
          localStorage.setItem(`bookLocation_${filename}`, locationString)
          const href = location.start.href
          const chapter = toc.find((item) => item.href === href)
          if (chapter) {
            setCurrentChapter(chapter.href)
          }
        }
      })
    }
  }, [rendition, theme, filename, toc])

  // Handle chapter changes
  const handleChapterChange = useCallback(
    (href: string) => {
      if (rendition) {
        rendition.display(href)
      }
    },
    [rendition],
  )

  // Handle page changes
  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (rendition) {
        const method = direction === 'prev' ? rendition.prev : rendition.next
        method.call(rendition)
      }
    },
    [rendition],
  )

  // Handle speaking
  const speak = useCallback(() => {
    if (!rendition) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const contents = rendition.getContents()
    console.log('contents', contents)
    // @ts-expect-error ignore
    if (contents.length === 0) return

    // @ts-expect-error ignore
    const content = contents[0]

    const text = content.documentElement.textContent || ''

    const newUtterance = new SpeechSynthesisUtterance(text)
    newUtterance.onend = () => {
      setIsSpeaking(false)
      handlePageChange('next')
    }

    // setUtterance(newUtterance)
    setIsSpeaking(true)
    window.speechSynthesis.speak(newUtterance)
  }, [rendition, isSpeaking, handlePageChange])

  // console.log('contents', rendition?.getContents())

  // Cleanup speech synthesis
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSpeaking])

  // Toggle the menu
  const toggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev)
  }, [])

  return (
    <Layout noFooter>
      {isLoading && <Loading />}
      <div className={`flex flex-col min-h-screen ${theme}`}>
        <div className='flex-grow md:container md:mx-auto max-w-7xl sm:px-6 lg:px-8 pt-8 pb-16'>
          <div ref={viewerRef} className='h-full' />
        </div>
        <div className='w-full pb-10 max-w-[400px] mx-auto'>
          <div className='flex justify-center items-center space-x-2'>
            <Button
              onClick={() => handlePageChange('prev')}
              variant='default'
              size='sm'
              className='w-full'>
              <ChevronLeftIcon className='h-4 w-4' /> Prev
            </Button>
            <Button
              onClick={() => handlePageChange('next')}
              variant='default'
              size='sm'
              className='w-full'>
              Next <ChevronRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <Footer />
        {rendition && (
          <ControlPanel
            isMenuExpanded={isMenuExpanded}
            toc={toc}
            currentChapter={currentChapter}
            onChapterChange={handleChapterChange}
            onPageChange={handlePageChange}
            onToggleMenu={toggleMenu}
            onToggleTTS={speak}
            isSpeaking={isSpeaking}
          />
        )}
      </div>
    </Layout>
  )
}

function Footer() {
  return (
    <footer className='bg-transparent  py-6 mt-auto'>
      <div className='container mx-auto px-4'>
        <p className='text-center text-sm md:text-base'>
          @ {new Date().getFullYear()} Greg's Novel-Land
        </p>
      </div>
    </footer>
  )
}

function ControlPanel({
  isMenuExpanded,
  toc,
  currentChapter,
  onChapterChange,
  onPageChange,
  onToggleMenu,
  onToggleTTS,
  isSpeaking,
}: {
  isMenuExpanded: boolean
  toc: NavItem[]
  currentChapter: string
  onChapterChange: (href: string) => void
  onPageChange: (direction: 'prev' | 'next') => void
  onToggleMenu: () => void
  onToggleTTS: () => void
  isSpeaking: boolean
}) {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg transition-all duration-300 ease-in-out',
        isMenuExpanded ? 'w-[calc(100%-2rem)] md:w-[400px] p-4' : 'w-12 h-12',
      )}>
      <div
        className={cn(
          'inset-0 p-4 transition-all duration-300 ease-in-out space-y-8',
          isMenuExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
        )}>
        <Button onClick={onToggleMenu} variant='ghost' size='sm' className='absolute top-2 right-2'>
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
        <Button onClick={onToggleTTS} variant='default' size='sm' className='w-full'>
          {isSpeaking ? <XIcon className='h-4 w-4' /> : <PlayIcon className='h-4 w-4' />}
        </Button>
        <div className='flex justify-between items-center space-x-2 pt-6'>
          <Button
            onClick={() => onPageChange('prev')}
            variant='default'
            size='sm'
            className='w-full'>
            <ChevronLeftIcon className='h-4 w-4' /> Prev
          </Button>
          <Button
            onClick={() => onPageChange('next')}
            variant='default'
            size='sm'
            className='w-full'>
            Next <ChevronRightIcon className='h-4 w-4' />
          </Button>
        </div>
        <Select value={currentChapter} onValueChange={onChapterChange}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Chapter' />
          </SelectTrigger>
          <SelectContent>
            {toc.map((chapter) => (
              <SelectItem key={chapter.href} value={chapter.href}>
                {chapter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onToggleMenu}
        variant='default'
        size='sm'
        className={cn(
          'absolute bottom-0 right-0 w-full h-full p-0 transition-all duration-300 ease-in-out',
          isMenuExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100',
          'bg-primary text-primary-foreground hover:bg-primary/90',
        )}>
        <MenuIcon className='h-6 w-6' />
      </Button>
    </div>
  )
}

export default NovelViewer

const findFirstContentChapter = (toc: NavItem[]): string | null => {
  // Skip items that are likely to be cover, info, or table of contents
  const skipTitles = ['cover', 'title', 'copyright', 'contents', 'table of contents', 'information']

  for (const item of toc) {
    const lowerLabel = item.label.toLowerCase()
    if (!skipTitles.some((title) => lowerLabel.includes(title))) {
      return item.href
    }
  }

  // If no suitable chapter found, return the first chapter
  return toc.length > 0 ? toc[0].href : null
}
