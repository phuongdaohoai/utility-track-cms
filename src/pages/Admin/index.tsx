import type { FC } from 'react'

export const AdminPage: FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        {['Total Users', 'Total Orders', 'Revenue', 'Pending Tasks'].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">{stat}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPage
