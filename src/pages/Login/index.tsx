import React, { FC, useState } from 'react'
import Button from '../../components/Button'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { login } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
export const LoginPage: FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [locale, setLocale] = useState<'vi' | 'en'>('vi')
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const authState = useAppSelector((s) => s.auth)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      const a = await dispatch(
        login({ identifier: emailOrPhone, password, locale }) as any
      ).unwrap()
      // TODO: navigate to dashboard or show success — router is configured elsewhere
      
      // For now just log success
      console.log('Login successful : ' + JSON.stringify(a))

      navigate('/admin');
    } catch (err) {
      console.error('Login failed', err)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: logo / visual */}
      <div className="hidden md:flex items-center justify-center bg-[#e8e8ef]">
        <div className="w-72 h-72 bg-white rounded-md shadow-lg flex items-center justify-center">
          <span className="text-2xl font-bold text-[#191c5e]">LOGO</span>
        </div>
      </div>

      {/* Right side: login form */}
      <div className="relative flex items-center justify-center bg-white">
        {/* Language switch top-right (inside relative container so absolute works) */}
        <div className="absolute top-[5%] right-[5%] z-20 font-bold flex items-center gap-6 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => setLocale('vi')}
            aria-pressed={locale === 'vi'}
            className={`focus:outline-none ${
              locale === 'vi'
                ? 'underline decoration-2 underline-offset-4 text-indigo-700'
                : 'text-gray-400 hover:text-indigo-600'
            }`}
          >
            Tiếng Việt
          </button>
          <span className="text-gray-300 select-none">|</span>
          <button
            type="button"
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
            className={`focus:outline-none ${
              locale === 'en'
                ? 'underline decoration-2 underline-offset-4 text-indigo-700'
                : 'text-gray-400 hover:text-indigo-600'
            }`}
          >
            English
          </button>
        </div>

        <div className="relative max-w-md w-full px-6 py-12">
          <div className="bg-white border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-[#191c5e] text-center mb-6">Đăng Nhập</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="emailOrPhone" className="block font-bold text-sm text-gray-600 mb-1">
                  Email hoặc Số điện thoại
                </label>
                {/* type="text" để hỗ trợ cả email lẫn số điện thoại */}
                <input
                  id="emailOrPhone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Email Hoặc Số Điện Thoại Của Bạn"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-bold text-sm text-gray-600 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật Khẩu Của Bạn"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    aria-describedby="forgot-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center pr-2 text-gray-500"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3C6 3 2.73 5.11 1 8c1.73 2.89 5 5 9 5s7.27-2.11 9-5c-1.73-2.89-5-5-9-5z" />
                        <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0110 19c-4 0-7.27-2.11-9-5a12.05 12.05 0 012.61-3.261" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-3-3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-sm mt-2">
                  <a id="forgot-password" href="#" className="text-indigo-600 font-bold hover:underline">
                    Quên Mật Khẩu?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  className="w-full bg-[#3a5a89]"
                  disabled={authState.status === 'loading'}
                >
                  {authState.status === 'loading' ? 'Đang xử lý...' : 'Đăng Nhập'}
                </Button>
                {authState.error ? (
                  <p className="text-sm text-red-600 mt-2">{authState.error}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
