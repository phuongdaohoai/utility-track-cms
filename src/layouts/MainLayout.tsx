import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

export const MainLayout: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Utility Track CMS</h1>
        </nav>
      </header>

      {/* Main Content: make this a flex column and let Outlet area scroll */}
      <main className="flex-1 flex min-h-0">
        {/* min-h-0 is important so flex child can shrink and overflow works */}
        <div className="flex-1 overflow-auto w-full">
          <main className="flex-1 flex flex-col overflow-auto">
            <div className="flex-1 px-6 py-6 md:px-8 lg:px-10">
              <Outlet />
            </div>
          </main>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2025 Utility Track CMS. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default MainLayout
