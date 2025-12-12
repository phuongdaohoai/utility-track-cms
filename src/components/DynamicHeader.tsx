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
  const title = headerTitles[location.pathname] || 'Dashboard'

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">B</div>
          <div className="text-sm text-gray-600">
            Bảo An<br/>
            <span className="text-xs text-gray-400">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DynamicHeader
