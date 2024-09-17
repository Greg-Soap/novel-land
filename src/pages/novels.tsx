import Layout from '@/layout/layout'
import GradualSpacing from '@/components/magicui/gradual-spacing'
import NovelList from '@/components/novel-list'
import { novels } from '@/novel-list'

export default function Novels() {
  return (
    <Layout>
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]'>
        <div className='flex flex-col items-center justify-center gap-4 text-center mt-6'>
          <GradualSpacing
            className='font-display text-center font-heading text-2xl font-bold tracking-[-0.1em]  text-black dark:text-white md:text-4xl '
            text='My Novel Collection'
          />
          <p className='text-xl mb-8 max-w-2xl'>A collection of my favorite novels.</p>
        </div>

        <NovelList novels={novels} />
      </div>
    </Layout>
  )
}
