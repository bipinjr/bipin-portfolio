import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router'
import './index.css'
import Shell from './components/Shell'
import Landing from './pages/Landing'
import Work from './pages/Work'
import Doors from './pages/Doors'
import OfferPage from './pages/OfferPage'
import Story from './pages/Story'
import ProjectPage from './pages/ProjectPage'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Crew from './pages/Crew'
import Privacy from './pages/Privacy'

// Inner pages sit in a centred column; the home page runs edge to edge.
const Inner = () => (
  <div className="mx-auto max-w-5xl px-5 py-14 sm:px-10">
    <Outlet />
  </div>
)

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/work', element: <Doors /> },
      { path: '/work/:id', element: <OfferPage /> },
      { path: '/story', element: <Story /> },
      { element: <Inner />, children: [
        { path: '/services', element: <Services /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/projects', element: <Work /> },
        { path: '/projects/:slug', element: <ProjectPage /> },
        { path: '/crew', element: <Crew /> },
        { path: '/privacy', element: <Privacy /> },
        { path: '*', element: <NotFound /> },
      ] },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
