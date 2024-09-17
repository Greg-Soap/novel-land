import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className='bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-800 font-heading'>
          <Link to='/'>Novel-Land</Link>
        </h1>
        <nav>
          <ul className='flex space-x-4'>
            <li>
              <Link to='/' className='text-gray-600 hover:text-gray-900 transition-colors'>
                Home
              </Link>
            </li>
            <li>
              <Link to='/novels' className='text-gray-600 hover:text-gray-900 transition-colors'>
                Novels
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
