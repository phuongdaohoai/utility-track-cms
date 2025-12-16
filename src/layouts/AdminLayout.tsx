import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
export const AdminLayout: FC = () => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 px-6 py-6 md:px-8 lg:px-10">
          <Outlet />
        </div>

      </main>

    </div>
  )
}

export default AdminLayout
