import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/home/page.jsx'
import Appointments from './pages/appointments/page.jsx'
import Profile from './pages/profile/page.jsx'
import Materials from './pages/materials/page.jsx'
import Auth from './pages/auth/page.jsx'

const pages = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/appointments', element: <Appointments /> },
      { path: '/profile', element: <Profile /> },
      { path: '/materials', element: <Materials /> },
      { path: '/auth', element: <Auth /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={pages} />
  </StrictMode>,
)
