import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import NovelViewer from './components/novel-veiwer'
import Root from './pages/root'
import Novels from './pages/novels'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/novels',
    element: <Novels />,
  },
  {
    path: '/reader/:filename',
    element: <NovelViewer />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
