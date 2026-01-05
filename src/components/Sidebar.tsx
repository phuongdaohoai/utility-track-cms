import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { FaUserFriends, FaRegUser, FaReceipt, FaNewspaper } from 'react-icons/fa'
import { IconType } from 'react-icons'
import { useLocale } from '../i18n/LocaleContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
  const { t } = useLocale();
  const navItem = (to: string, label: string, Icon: IconType) => (
    <NavLink
      to={to}
      onClick={onClose} // 👈 đóng sidebar khi click mobile
      end={to === '/admin'}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-md transition-colors ${
          isActive
            ? 'bg-[#5a749c] text-white'
            : 'text-gray-300 hover:bg-[#5a749c]/50 hover:text-white'
        }`
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-medium text-sm">{label}</span>
      </div>
    </NavLink>
  )

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#3a5a89] text-white p-4  flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}
    >
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-[#3a5a89] font-bold">
          S
        </div>
        <div className="font-semibold">System</div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItem('/admin', t.sidebar.dashboard, FaUserFriends)}
        {navItem('/admin/users', t.sidebar.manageUsers, FaReceipt)}
        {navItem('/admin/services', t.sidebar.manageServices, FaNewspaper)}
        {navItem('/admin/history', t.sidebar.usageHistory, FaRegUser)}
        {navItem('/admin/settings', t.sidebar.systemConfig, FaUserFriends)}
      </nav>

      <div className="mt-6 text-xs text-gray-300 mt-auto ">
        © 2025 Utility Track CMS
      </div>
    </aside>
  )
}

export default Sidebar
