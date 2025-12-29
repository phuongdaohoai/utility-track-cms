import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'

// Pages
import LoginPage from '../pages/Login'
import AdminPage from '../pages/Admin'
import UsersPage from '../pages/Admin/ManagerUsers'
import HistoryCheckinPage from '../pages/Admin/HistoryCheckin'
import ServicesPage from '../pages/Admin/Services'
import ServicesRepairPage from '../pages/Admin/ServicesRepair'
import SettingsPage from '../pages/Admin/Settings'
import Checkout from '../pages/User/Checkout'
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
    path: '/checkout',
    element: <Checkout />,
   
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
        path: 'services/new',
        element: <ServicesRepairPage />,
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
     
    ],
  },
])

export default router
