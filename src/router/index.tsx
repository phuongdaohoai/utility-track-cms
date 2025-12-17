import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/Home'
import LoginPage from '../pages/Login'
import AdminPage from '../pages/Admin'
import UsersPage from '../pages/Admin/ManagerUsers'
import ProfileEdit from '../pages/Admin/EditUsers'
import HistoryCheckinPage from '../pages/Admin/HistoryCheckin'
import ServicesPage from '../pages/Admin/Services'
import SettingsPage from '../pages/Admin/Settings'
import ServicesRepairPage from '../pages/Admin/ServicesRepair'
import Demo from '../pages/Admin/demo'
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
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/:id/edit', // vd /users/1/edit
        element: <ProfileEdit />,
      },{
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
      {
        path: 'test',
        element: <Demo />,
      },
    ],
  },
])

export default router
