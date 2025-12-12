import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/Home'
import LoginPage from '../pages/Login'
import AdminPage from '../pages/Admin'
import UsersPage from '../pages/Admin/ManagerUsers'

export const router = createBrowserRouter([
  {
    path: '/',
    // element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
    ],
  },
])

export default router
