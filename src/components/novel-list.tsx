import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

interface Novel {
  id: number
  title: string
  author: string
  filename: string
  image?: string
  description: string
  status: string
  chapters: number
  synopsis: string[]
}

interface NovelListProps {
  novels: Novel[]
}

function NovelList({ novels }: NovelListProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
      {novels.map(renderNovelCard)}
    </div>
  )
}

function NovelCover({ title, image }: { title: string; image?: string }) {
  const gradientAlt = (
    <div className='w-full aspect-[3/4] rounded-md flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 p-4'>
      <h3 className='text-white text-center font-bold text-lg break-words'>{title}</h3>
    </div>
  )

  if (image) {
    return (
      <div className='w-full aspect-[3/4] relative'>
        <img
          src={image}
          alt={title}
          className='rounded-md object-cover w-full h-full absolute inset-0'
          loading='lazy'
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallbackDiv = document.createElement('div')
            fallbackDiv.className =
              'w-full aspect-[3/4] rounded-md flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 p-4'
            fallbackDiv.innerHTML = `<h3 class="text-white text-center font-bold text-lg break-words">${title}</h3>`
            e.currentTarget.parentElement?.appendChild(fallbackDiv)
          }}
        />
      </div>
    )
  }

  return gradientAlt
}

function renderNovelCard(novel: Novel) {
  const truncatedSynopsis =
    novel.synopsis[0].slice(0, 100) + (novel.synopsis[0].length > 100 ? '...' : '')

  return (
    <div
      key={novel.id}
      className='border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between gap-8'>
      <div>
        <div className='mb-4 w-full'>
          <NovelCover title={novel.title} image={novel.image} />
        </div>
        <h2 className='text-xl font-bold mb-2 font-heading'>{novel.title}</h2>
        <p className='text-muted-foreground mb-2'>{novel.author}</p>
        <p className='text-sm mb-2'>
          Chapters: <span className='font-bold'>{novel.chapters}</span> | Status:{' '}
          <span
            className='font-bold'
            style={{ color: novel.status === 'Completed' ? 'green' : 'red' }}>
            {novel.status}
          </span>
        </p>
        <p className='text-sm mb-4'>
          {truncatedSynopsis}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='link' className='p-0 h-auto font-normal underline italic'>
                Read more
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>
                  {novel.title} - Chapter {novel.chapters}
                </DialogTitle>
              </DialogHeader>
              <div className='mt-4'>
                {novel.synopsis.map((paragraph, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <p key={index} className='mb-2'>
                    {paragraph}
                  </p>
                ))}
              </div>
              <DialogFooter className='mt-4 flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
                <Button asChild variant='default' className='w-full sm:w-auto'>
                  <Link to={`/reader/${novel.filename}`}>Read</Link>
                </Button>
                <Button asChild variant='outline' className='w-full sm:w-auto'>
                  <a href={`/novels/${novel.filename}`} download>
                    Download
                  </a>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </p>
      </div>
      <div className='flex justify-between gap-4 items-end'>
        <Button asChild variant='default' className='w-full'>
          <Link to={`/reader/${novel.filename}`}>Read</Link>
        </Button>
        <Button asChild variant='outline' className='w-full'>
          <a href={`/novels/${novel.filename}`} download>
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}

export default NovelList
