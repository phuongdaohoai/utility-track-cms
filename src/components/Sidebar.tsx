import type { FC } from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar: FC = () => {
  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block px-4 py-3 rounded-md hover:bg-gray-800/60 ${isActive ? 'bg-gray-800 text-white' : 'text-gray-200'}`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <aside className="w-64 bg-[#3a5a89] text-white p-4 flex flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded flex items-center justify-center">S</div>
        <div>
          <div className="font-semibold">System</div>
          <div className="text-xs text-gray-300">Admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItem('/admin', 'Dashboard tổng quan')}
        {navItem('/admin/users', 'Quản lý người dùng')}
        {navItem('/admin/services', 'Quản lý dịch vụ')}
        {navItem('/admin/history', 'Lịch sử sử dụng')}
        {navItem('/admin/settings', 'Cấu hình hệ thống')}
      </nav>

      <div className="mt-6 text-xs text-gray-400">© 2025 Utility Track CMS</div>
    </aside>
  )
}

export default Sidebar
