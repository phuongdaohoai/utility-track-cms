import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

interface User {
  id: number
  name: string
  role: string
  room?: number
  position?: string
  phone: string
  status: string
}

const sampleResidents: User[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Admin ${String.fromCharCode(65 + i)}`,
  role: 'Resident',
  room: i + 1,
  phone: '0903582234',
  status: i % 3 === 0 ? 'Không hoạt động' : 'Hoạt động',
}))

const sampleStaff: User[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 100,
  name: `Staff ${String.fromCharCode(65 + i)}`,
  role: i % 2 === 0 ? 'Admin' : 'Manager',
  position: i % 2 === 0 ? 'Admin' : 'Staff',
  phone: '0903582234',
  status: i % 2 === 0 ? 'Hoạt động' : 'Không hoạt động',
}))

type TabType = 'residents' | 'staff'

export const UsersPage: FC = () => {
  const [tab, setTab] = useState<TabType>('residents')
  const [query, setQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const currentData = tab === 'residents' ? sampleResidents : sampleStaff

  const filtered = useMemo(() => {
    if (!query) return currentData
    return currentData.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.phone.includes(query) ||
      (u.room?.toString().includes(query))
    )
  }, [query, currentData])

  return (
    <div>
      {/* Breadcrumb & Tab Navigation */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-4">Quản lý người dùng / {tab === 'residents' ? 'Danh sách dân cư' : 'Danh sách nhân sự'}</p>

        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setTab('residents')}
            className={`pb-3 font-medium transition-colors ${tab === 'residents' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Danh sách cư dân
          </button>
          <button
            onClick={() => setTab('staff')}
            className={`pb-3 font-medium transition-colors ${tab === 'staff' ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Danh sách nhân sự
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold mb-2">{tab === 'residents' ? 'Danh sách cư dân' : 'Danh sách nhân sự'}</h3>
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === 'residents' ? 'Tìm kiếm theo Tên, Phòng, Số điện thoại' : 'Tìm kiếm theo Tên, Vị trí, Số điện thoại'}
                className="w-full max-w-md px-3 py-2 border rounded-md"
              />
              <button className="bg-indigo-700 text-white px-4 py-2 rounded">Tìm Kiếm</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded bg-white">+ Import CSV</button>
            <Link to={`/admin/users/new?type=${tab}`} className="px-4 py-2 bg-indigo-700 text-white rounded">+ Thêm Mới</Link>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4"><input type="checkbox" /></th>
              <th className="text-left p-4">{tab === 'residents' ? 'Tên Cư Dân' : 'Tên Nhân Sự'}</th>
              <th className="text-left p-4">{tab === 'residents' ? 'Phòng' : 'Role'}</th>
              <th className="text-left p-4">Số Điện Thoại</th>
              <th className="text-left p-4">Trạng Thái</th>
              <th className="text-left p-4">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-4"><input type="checkbox" /></td>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{tab === 'residents' ? 'Cư dân' : u.role}</div>
                  </div>
                </td>
                <td className="p-4">{tab === 'residents' ? u.room : u.position}</td>
                <td className="p-4">{u.phone}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${u.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 bg-white border rounded">✏️</button>
                    <button className="p-2 bg-white border rounded">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm text-gray-600">
        <button className="px-3 py-1 border rounded">&lt;</button>
        <button className="px-3 py-1 border rounded bg-indigo-700 text-white">1</button>
        <button className="px-3 py-1 border rounded">2</button>
        <button className="px-3 py-1 border rounded">3</button>
        <button className="px-3 py-1 border rounded">&gt;</button>
      </div>
    </div>
  )
}

export default UsersPage
