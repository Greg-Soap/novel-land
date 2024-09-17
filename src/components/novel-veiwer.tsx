// import { useState, useEffect, useRef, useCallback } from 'react'
// import { useParams } from 'react-router-dom'
// import type { Book, Rendition, NavItem, Location } from 'epubjs'
// import { loadBook } from '@/utils/epub-helper'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/select'
// import { cn } from '@/lib/utils'
// import { ChevronRightIcon, Loader2, MenuIcon } from 'lucide-react'
// import Layout from '@/layout/layout'
// import { useTheme } from './theme-provider'

// function Loading() {
//   return (
//     <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
//       <div className='text-center'>
//         <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto' />
//         <p className='mt-4 text-lg font-semibold'>Loading...</p>
//       </div>
//     </div>
//   )
// }

// function NovelViewer() {
//   const [rendition, setRendition] = useState<Rendition | null>(null)
//   const { filename } = useParams()
//   const bookRef = useRef<Book | null>(null)
//   const viewerRef = useRef<HTMLDivElement>(null)
//   const { theme } = useTheme()
//   const [toc, setToc] = useState<NavItem[]>([])
//   const [currentChapter, setCurrentChapter] = useState<string>('')
//   const [isMenuExpanded, setIsMenuExpanded] = useState(false)
//   const lastThemeRef = useRef(theme)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const isMounted = true
//     async function initializeBook() {
//       // setIsLoading(true)
//       if (!filename || bookRef.current) return

//       try {
//         const newBook = await loadBook(`/novels/${filename}`)
//         if (!isMounted) return
//         bookRef.current = newBook
//         if (viewerRef.current) {
//           const newRendition = newBook.renderTo(viewerRef.current, {
//             width: '100%',
//             height: '100%',
//             flow: 'scrolled',
//             resizeOnOrientationChange: true,
//             stylesheet: '/epub.css',
//           })

//           newRendition.themes.select(theme)
//           setRendition(newRendition)

//           // Load saved location
//           const savedLocation = localStorage.getItem(`bookLocation_${filename}`)
//           if (savedLocation) {
//             await newRendition.display(savedLocation)
//           } else {
//             await newRendition.display()
//           }

//           const navigation = await newBook.loaded.navigation
//           setToc(navigation.toc)

//           if (navigation.toc.length > 0) {
//             setCurrentChapter(navigation.toc[0].href)
//           }

//           // Save location when it changes
//           newRendition.on('locationChanged', (location: Location) => {
//             localStorage.setItem(`bookLocation_${filename}`, location.start.toString())
//             const href = location.start.href
//             const chapter = navigation.toc.find((item) => item.href === href)
//             if (chapter) {
//               setCurrentChapter(chapter.href)
//             }
//           })
//         }
//       } catch (error) {
//         console.error('Error loading book:', error)
//       }
//       // finally {
//       // setIsLoading(false)
//       // }
//     }

//     initializeBook()

//     return () => {
//       if (bookRef.current) {
//         bookRef.current.destroy()
//         bookRef.current = null
//       }
//       setRendition(null)
//     }
//   }, [filename])

//   useEffect(() => {
//     if (rendition) {
//       const updateCurrentChapter = (location: Location) => {
//         const href = location.start.href
//         const chapter = toc.find((item) => item.href === href)
//         if (chapter) {
//           setCurrentChapter(chapter.href)
//         }
//       }

//       rendition.on('locationChanged', updateCurrentChapter)

//       return () => {
//         rendition.off('locationChanged', updateCurrentChapter)
//       }
//     }
//   }, [rendition, toc])

//   console.log({ rendition })

//   // useEffect(() => {
//   //   if (theme !== lastThemeRef.current) {
//   //     lastThemeRef.current = theme
//   //     setIsLoading(true)
//   //     // Save current location before reload

//   //     // Set a flag in sessionStorage to indicate we're changing theme
//   //     sessionStorage.setItem('themeChanging', 'true')
//   //     // Perform hard reload
//   //     window.location.reload()
//   //   }
//   // }, [theme, filename, rendition])

//   // useEffect(() => {
//   //   // Check if we're coming back from a theme change reload
//   //   const themeChanging = sessionStorage.getItem('themeChanging')
//   //   if (themeChanging) {
//   //     // Remove the flag
//   //     sessionStorage.removeItem('themeChanging')
//   //     // Keep the loading state true for a short time to ensure smooth transition
//   //     setTimeout(() => setIsLoading(false), 500)
//   //   }
//   // }, [])

//   const handleChapterChange = useCallback(
//     (href: string) => {
//       if (rendition) {
//         rendition.display(href)
//         setCurrentChapter(href)
//       }
//     },
//     [rendition],
//   )
//   console.log('currentChapter', currentChapter)
//   const handlePageChange = useCallback(
//     (direction: 'prev' | 'next') => {
//       if (rendition) {
//         const method = direction === 'prev' ? rendition.prev : rendition.next
//         method.call(rendition)

//         // Update current chapter after page change

//         const href = rendition.location.start.href
//         const chapter = toc.find((item) => item.href === href)
//         if (chapter) {
//           setCurrentChapter(chapter.href)
//         }
//       }
//     },
//     [rendition, toc],
//   )

//   const toggleMenu = useCallback(() => {
//     setIsMenuExpanded((prev) => !prev)
//   }, [])

//   return (
//     <Layout noFooter>
//       {/* {isLoading && <Loading />} */}
//       <div className={`flex flex-col min-h-screen ${theme}`}>
//         <div className='flex-grow md:container md:mx-auto max-w-7xl sm:px-6 lg:px-8 pt-8 pb-20'>
//           <div ref={viewerRef} className='h-full' />
//         </div>
//         <Footer />
//         {rendition && (
//           <ControlPanel
//             isMenuExpanded={isMenuExpanded}
//             toc={toc}
//             currentChapter={currentChapter}
//             onChapterChange={handleChapterChange}
//             onPageChange={handlePageChange}
//             onToggleMenu={toggleMenu}
//           />
//         )}
//       </div>
//     </Layout>
//   )
// }

// function Footer() {
//   return (
//     <footer className='bg-transparent  py-6 mt-auto'>
//       <div className='container mx-auto px-4'>
//         <p className='text-center text-sm md:text-base'>
//           @ {new Date().getFullYear()} Greg's Novel-Land
//         </p>
//       </div>
//     </footer>
//   )
// }

// function ControlPanel({
//   isMenuExpanded,
//   toc,
//   currentChapter,
//   onChapterChange,
//   onPageChange,
//   onToggleMenu,
// }: {
//   isMenuExpanded: boolean
//   toc: NavItem[]
//   currentChapter: string
//   onChapterChange: (href: string) => void
//   onPageChange: (direction: 'prev' | 'next') => void
//   onToggleMenu: () => void
// }) {
//   return (
//     <div
//       className={cn(
//         'fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg transition-all duration-300 ease-in-out',
//         isMenuExpanded ? 'w-[calc(100%-2rem)] md:w-[400px] p-4' : 'w-12 h-12',
//       )}>
//       <div
//         className={cn(
//           'inset-0 p-4 transition-all duration-300 ease-in-out space-y-8',
//           isMenuExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
//         )}>
//         <Button onClick={onToggleMenu} variant='ghost' size='sm' className='absolute top-2 right-2'>
//           <ChevronRightIcon className='h-4 w-4' />
//         </Button>
//         <div className='flex justify-between items-center space-x-2 pt-6'>
//           <Button
//             onClick={() => onPageChange('prev')}
//             variant='default'
//             size='sm'
//             className='w-full'>
//             Prev
//           </Button>
//           <Button
//             onClick={() => onPageChange('next')}
//             variant='default'
//             size='sm'
//             className='w-full'>
//             Next
//           </Button>
//         </div>
//         <Select value={currentChapter} onValueChange={onChapterChange}>
//           <SelectTrigger className='w-full'>
//             <SelectValue placeholder='Chapter' />
//           </SelectTrigger>
//           <SelectContent>
//             {toc.map((chapter) => (
//               <SelectItem key={chapter.href} value={chapter.href}>
//                 {chapter.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <Button
//         onClick={onToggleMenu}
//         variant='default'
//         size='sm'
//         className={cn(
//           'absolute bottom-0 right-0 w-full h-full p-0 transition-all duration-300 ease-in-out',
//           isMenuExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100',
//           'bg-primary text-primary-foreground hover:bg-primary/90',
//         )}>
//         <MenuIcon className='h-6 w-6' />
//       </Button>
//     </div>
//   )
// }

// export default NovelViewer

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
import { ChevronRightIcon, Loader2, MenuIcon } from 'lucide-react'
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
  // const [rendition, setRendition] = useState<Rendition | null>(null)
  // const { filename } = useParams()
  // const bookRef = useRef<Book | null>(null)
  // const viewerRef = useRef<HTMLDivElement>(null)
  // const { theme } = useTheme()
  // const [toc, setToc] = useState<NavItem[]>([])
  // const [currentChapter, setCurrentChapter] = useState<string>('')
  // const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  // const [isLoading, setIsLoading] = useState(true)

  // const initializeBook = useCallback(async () => {
  //   if (!filename || !viewerRef.current || bookRef.current) return

  //   setIsLoading(true)
  //   try {
  //     // Clear the viewer container
  //     if (viewerRef.current) {
  //       viewerRef.current.innerHTML = ''
  //     }
  //     const newBook = await loadBook(`/novels/${filename}`)
  //     bookRef.current = newBook

  //     const newRendition = newBook.renderTo(viewerRef.current, {
  //       width: '100%',
  //       height: '100%',
  //       flow: 'scrolled-doc',
  //       resizeOnOrientationChange: true,
  //       stylesheet: '/epub.css',
  //     })

  //     newRendition.themes.select(theme)
  //     setRendition(newRendition)

  //     const savedLocation = localStorage.getItem(`bookLocation_${filename}`)
  //     if (savedLocation) {
  //       await newRendition.display(savedLocation)
  //     } else {
  //       await newRendition.display()
  //     }

  //     const navigation = await newBook.loaded.navigation
  //     if (navigation?.toc) {
  //       setToc(navigation.toc)
  //       if (navigation.toc.length > 0) {
  //         setCurrentChapter(navigation.toc[0].href)
  //       }
  //     }

  //     newRendition.on('relocated', (location: Location) => {
  //       if (location?.start) {
  //         const locationString = location.start.cfi ? location.start.cfi.toString() : ''
  //         localStorage.setItem(`bookLocation_${filename}`, locationString)
  //         const href = location.start.href
  //         const chapter = navigation.toc.find((item) => item.href === href)
  //         if (chapter) {
  //           setCurrentChapter(chapter.href)
  //         }
  //       }
  //     })
  //   } catch (error) {
  //     console.error('Error loading book:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [filename, theme])

  // useEffect(() => {
  //   initializeBook()

  //   return () => {
  //     if (bookRef.current) {
  //       bookRef.current.destroy()
  //       bookRef.current = null
  //     }
  //     if (rendition) {
  //       rendition.destroy()
  //     }
  //     setRendition(null)
  //   }
  // }, [initializeBook, rendition])

  // useEffect(() => {
  //   if (rendition) {
  //     rendition.themes.select(theme)
  //   }
  // }, [theme, rendition])

  // const handleChapterChange = useCallback(
  //   (href: string) => {
  //     if (rendition) {
  //       rendition.display(href)
  //     }
  //   },
  //   [rendition],
  // )

  // const handlePageChange = useCallback(
  //   (direction: 'prev' | 'next') => {
  //     if (rendition) {
  //       const method = direction === 'prev' ? rendition.prev : rendition.next
  //       method.call(rendition)
  //     }
  //   },
  //   [rendition],
  // )

  // const toggleMenu = useCallback(() => {
  //   setIsMenuExpanded((prev) => !prev)
  // }, [])

  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const { filename } = useParams()
  const viewerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [toc, setToc] = useState<NavItem[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>('')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
          if (navigation.toc.length > 0) {
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
        rendition.display()
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

  const handleChapterChange = useCallback(
    (href: string) => {
      if (rendition) {
        rendition.display(href)
      }
    },
    [rendition],
  )

  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (rendition) {
        const method = direction === 'prev' ? rendition.prev : rendition.next
        method.call(rendition)
      }
    },
    [rendition],
  )

  const toggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev)
  }, [])

  return (
    <Layout noFooter>
      {isLoading && <Loading />}
      <div className={`flex flex-col min-h-screen ${theme}`}>
        <div className='flex-grow md:container md:mx-auto max-w-7xl sm:px-6 lg:px-8 pt-8 pb-20'>
          <div ref={viewerRef} className='h-full' />
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
}: {
  isMenuExpanded: boolean
  toc: NavItem[]
  currentChapter: string
  onChapterChange: (href: string) => void
  onPageChange: (direction: 'prev' | 'next') => void
  onToggleMenu: () => void
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
        <div className='flex justify-between items-center space-x-2 pt-6'>
          <Button
            onClick={() => onPageChange('prev')}
            variant='default'
            size='sm'
            className='w-full'>
            Prev
          </Button>
          <Button
            onClick={() => onPageChange('next')}
            variant='default'
            size='sm'
            className='w-full'>
            Next
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
