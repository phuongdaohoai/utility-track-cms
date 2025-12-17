import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumb } from '../utils/breadcrumb'

const TopNav = () => {
  const { pathname } = useLocation()
  const breadcrumbs = getBreadcrumb(pathname)

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex items-center justify-between">

        {/* BREADCRUMB */}
        <div className="text-sm font-semibold text-[#8889ab]">
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.path ? (
                <Link
                  to={item.path}
                  className="hover:text-[#333570]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#333570] font-bold">
                  {item.label}
                </span>
              )}

              {index < breadcrumbs.length - 1 && ' / '}
            </span>
          ))}
        </div>

        {/* USER INFO */}
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

export default TopNav
