import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/Home'
import LoginPage from '../pages/Login'
import AdminPage from '../pages/Admin'
import UsersPage from '../pages/Admin/Users'
import HistoryCheckinPage from '../pages/Admin/HistoryCheckin'
import ServicesPage from '../pages/Admin/Services'
import SettingsPage from '../pages/Admin/Settings'
import ServicesRepairPage from '../pages/Admin/ServicesRepair'

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
      {
        path: 'services',
        element: <ServicesPage />,
      },
      {
      path: 'services/:id',
      element: <ServicesRepairPage />,
    },
      {
        path: 'history',
        element: <HistoryCheckinPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export default router
