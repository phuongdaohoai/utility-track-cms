import { FC, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';

import { getBreadcrumb } from '../utils/breadcrumb';
import { useAppSelector } from '../store/hooks';
import { API_BASE_URL } from '../utils/url';
import { useLocale } from '../i18n/LocaleContext';
interface TopNavProps {
  onMenuClick?: () => void;
}

const TopNav: FC<TopNavProps> = ({ onMenuClick }) => {
  const { t, locale } = useLocale();
  const { pathname } = useLocation();
  const breadcrumbs = getBreadcrumb(pathname, locale);
  const navigate = useNavigate();

  const { name, role, avatar } = useAppSelector(
    (state) => state.auth.user || { name: 'User', role: 'Guest', avatar: '' }
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const safeName = name || 'User';
  const displayName = safeName.length > 12 ? `${safeName.slice(0, 12)}…` : safeName;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          )}

          {/* Breadcrumb (desktop only) */}
          <nav className="hidden md:flex text-sm font-semibold text-[#8889ab]">
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center">
                {item.path ? (
                  <Link
                    to={item.path}
                    className="hover:text-[#333570] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#333570] font-bold">
                    {item.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2">/</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-6">

          {/* Notification */}
          <button
            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full
                       bg-indigo-50 text-indigo-900
                       flex items-center justify-center
                       hover:bg-indigo-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden
                              bg-indigo-100 text-indigo-700
                              flex items-center justify-center
                              font-bold border border-gray-200">
                {avatar ? (
                  <img
                    src={`${API_BASE_URL}${avatar}`} // Ghép đường dẫn ảnh với API URL
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  // Fallback: Nếu không có ảnh thì hiện chữ cái đầu của tên
                  <span>{safeName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* User info (desktop only) */}
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-bold text-gray-800" title={safeName}>
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {role}
                </div>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56
                           bg-white rounded-xl shadow-lg
                           border border-gray-100
                           py-2
                           animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* Mobile user info */}
                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-bold text-gray-800">{safeName}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>

                {/* <div className="px-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm
                               text-gray-700 rounded-lg
                               hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <User size={18} />
                    Thông tin tài khoản
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm
                               text-gray-700 rounded-lg
                               hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <Settings size={18} />
                    Cài đặt
                  </Link>
                </div> */}

                <div className="h-px bg-gray-100 my-2 mx-2" />

                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm
                               text-red-600 rounded-lg
                               hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={18} />
                    {t.common.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
