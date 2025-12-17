import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'

// Pages
import LoginPage from '../pages/Login'
import AdminPage from '../pages/Admin'
import UsersPage from '../pages/Admin/ManagerUsers'
import HistoryCheckinPage from '../pages/Admin/HistoryCheckin'
import ServicesPage from '../pages/Admin/Services'
import ServicesRepairPage from '../pages/Admin/ServicesRepair'
import Demo from '../pages/Admin/demo'
import SettingsPage from '../pages/Admin/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    children: [
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
      // Dashboard
      {
        index: true,
        element: <AdminPage />,
      },

      // Users
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

      // History
      {
        path: 'history',
        element: <HistoryCheckinPage />,
      },

      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'test',
        element: <Demo />,
      },
    ],
  },
])

export default router
