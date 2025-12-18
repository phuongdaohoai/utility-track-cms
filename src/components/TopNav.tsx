import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumb } from '../utils/breadcrumb';
import { useAppSelector } from '../store/hooks';

import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'

const TopNav = () => {
  const { pathname } = useLocation();
  const breadcrumbs = getBreadcrumb(pathname);

  const navigate = useNavigate();

  const { name, role, avatar } = useAppSelector((state) => state.auth.user || { name: 'User', role: 'Guest', avatar: '' });


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
   localStorage.clear();
   navigate('/');
  };

  const safeName = name || 'User';
  const displayName = safeName.length > 10 ? `${safeName.slice(0, 10)}...` : safeName;

  return (
    <header className="bg-white shadow-sm px-6 py-3 border-b border-gray-100 z-20 relative">
      <div className="flex items-center justify-between">

        <div className="text-sm font-semibold text-[#8889ab] hidden md:block">
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.path ? (
                <Link to={item.path} className="hover:text-[#333570] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#333570] font-bold">
                  {item.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 ml-auto">
          
          <button className="relative w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-900 hover:bg-indigo-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors focus:outline-none"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-gray-200">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  safeName.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Info Text */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-bold text-gray-800 leading-tight" title={safeName}>
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {role}
                </div>
              </div>

             
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

          
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              
                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                    <p className="text-sm font-bold text-gray-800">{safeName}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                </div>

                <div className="px-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={18} />
                      Thông tin tài khoản
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={18} />
                      Cài đặt
                    </Link>
                </div>

                <div className="h-px bg-gray-100 my-2 mx-2"></div>

                <div className="px-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={18} />
                      Đăng xuất
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