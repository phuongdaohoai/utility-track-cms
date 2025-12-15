import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, setPage } from '../../store/usersSlice'
import { useNavigate } from 'react-router-dom';
import { deleteStaff } from '../../store/staffSlice';
import { CSVImportButton } from "../../components/CSVImport";
type TabType = 'residents' | 'staff'

export const UsersPage: FC = () => {
  const { name, role } = useAppSelector((state) => state.auth.user || { name: 'User', role: 'Guest' });


  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('staff')
  const [query, setQuery] = useState<string>('')

  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, status, error } = useAppSelector((s) => s.users)

  useEffect(() => {

    dispatch(fetchUsers({ type: tab, query, page, pageSize }))
  }, [dispatch, tab, query, page, pageSize])

  const onPage = (p: number) => {
    dispatch(setPage(p))
  }
  const handleDelete = async (id: number) => {
    if (tab !== 'staff') {
      alert("Chức năng xóa cư dân chưa được hỗ trợ ở đây.");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
      try {

        await dispatch(deleteStaff(id)).unwrap();

        alert("Xóa thành công!");


        dispatch(fetchUsers({ type: tab, query, page, pageSize }));
      } catch (err: any) {
        alert("Xóa thất bại: " + (err || "Lỗi hệ thống"));
      }
    }
  }
  return (
    <div className='overflow-auto'>
      <header className="bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-semibold text-[#8889ab]">
            Quản lý phân quyền / <span className="text-[#333570] font-bold">Danh sách Admin</span>
          </h6>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">B</div>
            <div className="text-sm text-gray-600">
              {name}<br />
              <span className="text-xs text-gray-400">{role}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">


        <div className="flex gap-4 border-b border-[#cecfdd] mb-3">
          <button
            onClick={() => setTab('residents')}
            className={`pb-3  transition-colors px-3 py-0 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'residents'
              ? 'text-indigo-700 font-bold  border-b-2 border-b-indigo-700'
              : 'text-gray-600 hover:text-gray-900 border-b border-b-[#cecfdd]'
              }`}
          >
            Danh sách cư dân
          </button>
          <button
            onClick={() => setTab('staff')}
            className={`pb-3  transition-colors px-3 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'staff'
              ? 'text-indigo-700 font-bold border-b-2 border-b-indigo-700'
              : 'text-gray-600  hover:text-gray-900 border-b border-b-[#cecfdd]'
              }`}
          >
            Danh sách nhân sự
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">

              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === 'residents' ? 'Tìm kiếm theo Tên, Phòng, Số điện thoại' : 'Tìm kiếm theo Tên, Vị trí, Số điện thoại'}
                  className="w-full max-w-md px-3 py-2 border rounded-md"
                />
                <button
                  onClick={() => dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }))}
                  className="bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Tìm Kiếm
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {tab === 'residents' && (
                <CSVImportButton importType="residents" />
              )}
              {tab === 'staff' && (
                <CSVImportButton importType="staff" />
              )}
              <Link to={`/admin/users/new?type=${tab}`} className="px-4 py-2 bg-indigo-700 text-white rounded">
                + Thêm Mới
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 w-[72px] h-[72px]"><input type="checkbox" /></th>
                <th className="text-left p-4">{tab === 'residents' ? 'Tên Cư Dân' : 'Tên Nhân Sự'}</th>
                <th className="text-left p-4">{tab === 'residents' ? 'Phòng' : 'Role'}</th>
                <th className="text-left p-4">Số Điện Thoại</th>
                <th className="text-left p-4">Trạng Thái</th>
                <th className="text-left p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Đang tải...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-red-600">{error}</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Không tìm thấy kết quả</td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className=" pl-[28px] w-[72px] h-[72px]"><input type="checkbox" /></td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div>
                        <div className="font-medium">{u.fullName}</div>
                        <div className="text-xs text-gray-500">{tab === 'residents' ? 'Cư dân' : null}</div>
                      </div>
                    </td>
                    <td className="p-4">{tab === 'residents' ? u.room : u.role?.roleName}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${Number(u.status) === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {Number(u.status) === 1 ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          // 3. Thêm sự kiện onClick chuyển hướng
                          onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                          className="p-2 bg-white border rounded hover:bg-gray-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 bg-white border rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Xóa nhân viên"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <button onClick={() => onPage(Math.max(1, page - 1))} className="px-3 py-1">&lt;</button>
          {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }).slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => onPage(i + 1)}
              className={`px-3 py-1 ${page === i + 1 ? 'bg-indigo-700 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => onPage(Math.min(Math.ceil(total / pageSize), page + 1))} className="px-3 py-1">&gt;</button>
        </div>
      </div>
    </div>
  )
}

export default UsersPage
