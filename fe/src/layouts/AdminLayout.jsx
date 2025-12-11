/**
 * AdminLayout Component
 * Layout for admin pages with sidebar navigation
 */
import { Outlet } from 'react-router-dom';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <div className="text-xl font-bold mb-8">Admin Panel</div>
        <nav className="space-y-4">
          <a href="/admin" className="block p-2 rounded hover:bg-gray-800">Dashboard</a>
          <a href="/admin/users" className="block p-2 rounded hover:bg-gray-800">Users</a>
          <a href="/admin/settings" className="block p-2 rounded hover:bg-gray-800">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
