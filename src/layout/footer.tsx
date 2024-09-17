export default function Footer() {
  return (
    <footer className='bg-[#262626] text-white py-6'>
      <div className='container mx-auto'>
        <p className='text-center text-sm md:text-base'>
          📚 &copy; {new Date().getFullYear()} by{' '}
          <a
            href='/'
            rel='noopener noreferrer'
            className='text-blue-300 hover:text-blue-200 transition-colors'>
            Greg 📖
          </a>
        </p>
      </div>
    </footer>
  )
}
