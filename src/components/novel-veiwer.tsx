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
import { ChevronRightIcon, MenuIcon } from 'lucide-react'
import Layout from '@/layout/layout'

function NovelViewer() {
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const { filename } = useParams()
  const bookRef = useRef<Book | null>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  // const [currentFontSize, setCurrentFontSize] = useState<number>(18)
  const [toc, setToc] = useState<NavItem[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>('')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function initializeBook() {
      if (!filename || bookRef.current) return

      try {
        const newBook = await loadBook(`/novels/${filename}`)
        if (!isMounted) return

        bookRef.current = newBook
        if (viewerRef.current) {
          const newRendition = newBook.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            flow: 'scrolled',
            resizeOnOrientationChange: true,
            stylesheet: '/epub.css',
          })
          setRendition(newRendition)

          // Load saved location
          const savedLocation = localStorage.getItem(`bookLocation_${filename}`)
          if (savedLocation) {
            await newRendition.display(savedLocation)
          } else {
            await newRendition.display()
          }

          const navigation = await newBook.loaded.navigation
          setToc(navigation.toc)

          if (navigation.toc.length > 0) {
            setCurrentChapter(navigation.toc[0].href)
          }

          // Save location when it changes
          newRendition.on('locationChanged', (location: Location) => {
            localStorage.setItem(`bookLocation_${filename}`, location.start.toString())
            const href = location.start.href
            const chapter = navigation.toc.find((item) => item.href === href)
            if (chapter) {
              setCurrentChapter(chapter.href)
            }
          })
        }
      } catch (error) {
        console.error('Error loading book:', error)
      }
    }

    initializeBook()

    return () => {
      isMounted = false
      if (bookRef.current) {
        bookRef.current.destroy()
        bookRef.current = null
      }
      setRendition(null)
    }
  }, [filename])

  useEffect(() => {
    if (rendition) {
      const updateCurrentChapter = (location: Location) => {
        const href = location.start.href
        const chapter = toc.find((item) => item.href === href)
        if (chapter) {
          setCurrentChapter(chapter.href)
        }
      }

      rendition.on('locationChanged', updateCurrentChapter)

      return () => {
        rendition.off('locationChanged', updateCurrentChapter)
      }
    }
  }, [rendition, toc])

  console.log({ rendition })

  // const updateFontSize = useCallback(
  //   (delta: number) => {
  //     if (rendition) {
  //       const newSize = Math.max(12, Math.min(24, currentFontSize + delta))
  //       rendition.themes.fontSize(`${newSize}px`)
  //       setCurrentFontSize(newSize)
  //     }
  //   },
  //   [rendition, currentFontSize],
  // )

  const handleChapterChange = useCallback(
    (href: string) => {
      if (rendition) {
        rendition.display(href)
        setCurrentChapter(href)
      }
    },
    [rendition],
  )

  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (rendition) {
        const method = direction === 'prev' ? rendition.prev : rendition.next
        method.call(rendition)

        // Update current chapter after page change

        const href = rendition.location.start.href
        const chapter = toc.find((item) => item.href === href)
        if (chapter) {
          setCurrentChapter(chapter.href)
        }
      }
    },
    [rendition, toc],
  )

  const toggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev)
  }, [])

  return (
    <Layout noFooter>
      <div className={cn('flex flex-col h-screen relative ')}>
        <div className='container mx-auto max-w-7xl pb-20'>
          <div ref={viewerRef} />
        </div>
        <footer className=' text-gray-500 py-6'>
          <div className='container mx-auto'>
            <p className='text-center text-sm md:text-base'>
              @ {new Date().getFullYear()} Greg's Novel-Land
            </p>
          </div>
        </footer>
        {rendition && (
          <div
            className={cn(
              'fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 ease-in-out',
              isMenuExpanded ? 'w-full md:w-[400px] p-4' : 'w-12 h-12',
            )}>
            <div
              className={cn(
                ' inset-0 p-4 transition-all duration-300 ease-in-out space-y-8',
                isMenuExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
              )}>
              <Button
                onClick={toggleMenu}
                variant='ghost'
                size='sm'
                className='absolute top-2 right-2'>
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
              <div className='flex justify-between items-center space-x-2 pt-6'>
                <Button onClick={() => handlePageChange('prev')} variant='outline' size='sm'>
                  Prev
                </Button>
                <Button onClick={() => handlePageChange('next')} variant='outline' size='sm'>
                  Next
                </Button>
              </div>
              <Select value={currentChapter} onValueChange={handleChapterChange}>
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
              {/* <div className='flex items-center justify-between'>
                <Button onClick={() => updateFontSize(-1)} variant='outline' size='sm'>
                  A-
                </Button>
                <span>{currentFontSize}px</span>
                <Button onClick={() => updateFontSize(1)} variant='outline' size='sm'>
                  A+
                </Button>
              </div> */}
            </div>
            <Button
              onClick={toggleMenu}
              variant='ghost'
              size='sm'
              className={cn(
                ' absolute bottom-0 right-0 w-full h-full p-0 transition-all duration-300 ease-in-out',
                isMenuExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100',
              )}>
              <MenuIcon className='h-6 w-6' />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default NovelViewer
