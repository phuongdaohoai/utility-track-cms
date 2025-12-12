import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { FaUserFriends, FaRegUser , FaReceipt , FaNewspaper  } from 'react-icons/fa'
import { IconType } from 'react-icons'
const Sidebar: FC = () => {
 const navItem = (to: string, label: string, Icon: IconType) => (
    <NavLink
      to={to}
      end={to === '/admin'} // Lưu ý: Chỉ dùng end cho trang chủ dashboard để tránh active nhầm
      className={({ isActive }) =>
        `block px-4 py-3 rounded-md transition-colors ${
          isActive 
            ? 'bg-[#5a749c] text-white' 
            : 'text-gray-300 hover:bg-[#5a749c]/50 hover:text-white'
        }`
      }
    >
      {/* 3. Bọc nội dung trong flex để căn chỉnh icon và chữ */}
      <div className="flex items-center gap-3">
        {/* Render Icon */}
        <Icon size={18} /> 
        <span className="font-medium text-sm">{label}</span>
      </div>
    </NavLink>
  )

  return (
    <aside className="w-64 bg-[#3a5a89] text-white p-4 flex flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded flex items-center justify-center">S</div>
        <div>
          <div className="font-semibold">System</div>
         
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItem('/admin', 'Dashboard tổng quan', FaUserFriends)}
        {navItem('/admin/users', 'Quản lý người dùng', FaReceipt )}
        {navItem('/admin/services', 'Quản lý dịch vụ', FaNewspaper )}
        {navItem('/admin/history', 'Lịch sử sử dụng', FaRegUser)}
        {navItem('/admin/settings', 'Cấu hình hệ thống', FaUserFriends)}
      </nav>

      <div className="mt-6 text-xs text-gray-400">© 2025 Utility Track CMS</div>
    </aside>
  )
}

export default Sidebar
