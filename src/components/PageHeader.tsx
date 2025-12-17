import type { FC } from 'react'
import { useAppSelector } from '../store/hooks'

interface PageHeaderProps {
  breadcrumbs: string[] // ['Quản lý phân quyền', 'Danh sách Admin']
}

const PageHeader: FC<PageHeaderProps> = ({ breadcrumbs }) => {
  const { name, role } = useAppSelector(
    (state) => state.auth.user || { name: 'User', role: 'Guest' }
  )

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <h6 className="text-sm font-semibold text-[#8889ab]">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <span key={index}>
                {index > 0 && ' / '}
                {isLast ? (
                  <span className="text-[#333570] font-bold">{item}</span>
                ) : (
                  item
                )}
              </span>
            )
          })}
        </h6>

        {/* User info */}
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">
            {name}
            <br />
            <span className="text-xs text-gray-400">{role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
