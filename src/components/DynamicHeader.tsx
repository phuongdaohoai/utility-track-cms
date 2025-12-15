import type { FC } from 'react'
import { useLocation } from 'react-router-dom'

interface HeaderTitles {
  [key: string]: string
}

const headerTitles: HeaderTitles = {
  '/admin': 'Dashboard tổng quan',
  '/admin/users': 'Quản lý người dùng',
  '/admin/services': 'Quản lý dịch vụ',
  '/admin/history': 'Lịch sử sử dụng',
  '/admin/settings': 'Cấu hình hệ thống',
}

export const DynamicHeader: FC = () => {
  const location = useLocation()
  const pathname = location.pathname

  let title = 'Dashboard'

  if (pathname === '/admin') {
    title = 'Dashboard tổng quan'
  } 
  else if (pathname === '/admin/services') {
    title = 'Quản lý dịch vụ'
  } 
  else if (pathname.startsWith('/admin/services/')) {
    title = 'Chi tiết dịch vụ'   // 👈 ĐỔI Ở ĐÂY
  }
  else if (pathname.startsWith('/admin/users')) {
    title = 'Quản lý người dùng'
  } 
  else if (pathname.startsWith('/admin/history')) {
    title = 'Lịch sử sử dụng'
  } 
  else if (pathname.startsWith('/admin/settings')) {
    title = 'Cấu hình hệ thống'
  }

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
            B
          </div>
          <div className="text-sm text-gray-600">
            Bảo An<br />
            <span className="text-xs text-gray-400">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DynamicHeader
