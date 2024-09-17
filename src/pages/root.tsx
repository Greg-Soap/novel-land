import GradualSpacing from '@/components/magicui/gradual-spacing'
import Layout from '@/layout/layout'

export default function Root() {
  return (
    <Layout>
      <div className='max-w-4xl mx-auto py-12 px-4 text-center'>
        <GradualSpacing
          className='font-display text-center font-heading text-4xl font-bold tracking-[-0.1em] mb-4 text-black dark:text-white md:text-7xl md:leading-[5rem]'
          text='My Digital Bookshelf'
        />

        <p className='text-lg mb-8 text-secondary-foreground'>
          Welcome to my personal corner of the internet! This is where I keep all my favorite novels
          in one convenient place.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <FeatureItem
            title='My Collection'
            description="This is where I store all the books I love. It's like having my own personal library, always at my fingertips."
          />
          <FeatureItem
            title='Read Anywhere'
            description="I can access my books anytime, anywhere. Perfect for when I'm traveling or just lounging at home."
          />
          <FeatureItem
            title='Easy Sharing'
            description="When I find a book I really love, I can easily share it with my friends. It's a great way to spread the joy of reading."
          />
          <FeatureItem
            title='My Reading Journey'
            description='This bookshelf is a reflection of my reading journey. Each book here has a special place in my heart and mind.'
          />
        </div>

        <p className='text-lg mt-8 text-secondary-foreground'>
          Feel free to browse through my collection. If you see something you'd like to read, just
          let me know!
        </p>
      </div>
    </Layout>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
      <h2 className='text-2xl font-bold mb-3 font-heading'>{title}</h2>
      <p className='text-secondary-foreground'>{description}</p>
    </div>
  )
}
