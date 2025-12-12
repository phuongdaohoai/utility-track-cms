import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DynamicHeader from '../components/DynamicHeader'

export const AdminLayout: FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">    
          <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
