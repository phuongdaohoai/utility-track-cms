import type { FC } from 'react'
import { useEffect, useState, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, setPage } from '../../store/usersSlice'
import { deleteStaff } from '../../store/staffSlice';
import { CSVImportButton } from "../../components/CSVImport";
import { CreateStaffButton } from '../../components/staff/CreateStaffButton';
import { FilterModal, FilterConfig, FilterCondition } from '../../components/fill/FilterModal';
import { CreateResidentButton } from '../../components/residents/CreateResidentButton';
import { deleteResident } from '../../store/residentsSlice';
import { EditStaffModal } from '../../components/staff/EditStaffModal';
import { EditResidentModal } from '../../components/residents/EditResidentModal';


type TabType = 'residents' | 'staff'

export const UsersPage: FC = () => {
  const [tab, setTab] = useState<TabType>('staff')
  const [query, setQuery] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);

  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, status, error } = useAppSelector((s) => s.users)

  const residentFields: FilterConfig[] = useMemo(() => [
    { key: 'fullName', label: 'Tên cư dân', type: 'string' },
    { key: 'phone', label: 'Số điện thoại', type: 'string' },
    { key: 'room', label: 'Phòng', type: 'string' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ label: 'Hoạt động', value: 1 }, { label: 'Không hoạt động', value: 0 }] },
    { key: 'joinDate', label: 'Ngày gia nhập', type: 'date' },
  ], []);

  const staffFields: FilterConfig[] = useMemo(() => [
    { key: 'fullName', label: 'Tên nhân sự', type: 'string' },
    { key: 'phone', label: 'Số điện thoại', type: 'string' },
    { key: 'roleId', label: 'Chức vụ', type: 'select', options: [{ label: 'Admin', value: 1 }, { label: 'Manager', value: 2 }, { label: 'Staff', value: 3 }] },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [{ label: 'Hoạt động', value: 1 }, { label: 'Không hoạt động', value: 0 }] },
  ], []);

  const currentFields = tab === 'residents' ? residentFields : staffFields;

  // --- Logic tạo gợi ý (Suggestions) từ dữ liệu bảng ---
  const suggestionsData = useMemo(() => {
    if (!items || items.length === 0) return {};

    const uniqueNames = new Set<string>();
    const uniquePhones = new Set<string>();
    const uniqueEmails = new Set<string>();
    const uniqueRooms = new Set<string>();

    items.forEach((user) => {
      if (user.fullName) uniqueNames.add(user.fullName);
      if (user.phone) uniquePhones.add(user.phone);
      if (user.email) uniqueEmails.add(user.email);
      
      // Xử lý gợi ý cho trường 'room' (residents) hoặc 'roleId' (staff - nếu muốn gợi ý text)
      const roomVal = user.apartment?.roomNumber || user.apartment?.floorNumber;
      if (roomVal) uniqueRooms.add(String(roomVal));
    });

    return {
      fullName: Array.from(uniqueNames),
      phone: Array.from(uniquePhones),
      email: Array.from(uniqueEmails),
      room: Array.from(uniqueRooms),
    };
  }, [items]);

  const refreshList = () => {
    dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }));
    setEditingId(null);
    setSelectedIds([]);
  };

  useEffect(() => {
    dispatch(fetchUsers({ type: tab, query, page, pageSize }))
  }, [dispatch, tab, page, pageSize])

  const onPage = (p: number) => {
    dispatch(setPage(p))
  }

  const handleDelete = async (id: number) => {
    const isStaff = tab === 'staff';
    const confirmMessage = isStaff
      ? "Bạn có chắc chắn muốn xóa nhân viên này không?"
      : "Bạn có chắc chắn muốn xóa cư dân này không?";

    if (window.confirm(confirmMessage)) {
      try {
        if (isStaff) {
          await dispatch(deleteStaff(id)).unwrap();
        } else {
          await dispatch(deleteResident(id)).unwrap();
        }
        alert("Xóa thành công!");
        refreshList();
      } catch (err: any) {
        alert("Xóa thất bại: " + (err || "Lỗi hệ thống"));
      }
    }
  }

  const handleApplyFilter = (filters: FilterCondition[]) => {
    setActiveFilters(filters);
    console.log("Applying filters:", filters);
    dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }));
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((u) => u.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
      ? prev.filter((i) => i !== id)
      : [...prev, id]
    );
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [tab, page]);

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Xóa ${selectedIds.length} mục đã chọn?`)) return

    try {
      await Promise.all(
        selectedIds.map(id => {
          return tab === 'staff' 
            ? dispatch(deleteStaff(id)).unwrap() 
            : dispatch(deleteResident(id)).unwrap()
        })
      );
      
      alert(`Đã xóa ${selectedIds.length} mục thành công!`);
      refreshList();
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa một số mục.");
      refreshList();
    }
  }

  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }));
    }
  };

  return (
    <div className='overflow-auto'>
      {editingId && tab === 'staff' && (
        <EditStaffModal
          isOpen={true}
          staffId={editingId}
          onClose={() => setEditingId(null)}
          onSuccess={refreshList}
        />
      )}

      {editingId && tab === 'residents' && (
        <EditResidentModal
          isOpen={true}
          residentId={editingId}
          onClose={() => setEditingId(null)}
          onSuccess={refreshList}
        />
      )}
      
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
        availableFields={currentFields}
        tagData={suggestionsData} 
      />
      
   
      <div className="flex-1 overflow-auto mx-5 sm:mx-14 mt-7">

        <div className="flex gap-4 border-b border-[#cecfdd] mb-3">
          <button
            onClick={() => setTab('residents')}
            className={`pb-3 transition-colors px-3 py-0 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'residents'
              ? 'text-indigo-700 font-bold border-b-2 border-b-indigo-700'
              : 'text-gray-600 hover:text-gray-900 border-b border-b-[#cecfdd]'
              }`}
          >
            Danh sách cư dân
          </button>
          <button
            onClick={() => setTab('staff')}
            className={`pb-3 transition-colors px-3 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'staff'
              ? 'text-indigo-700 font-bold border-b-2 border-b-indigo-700'
              : 'text-gray-600 hover:text-gray-900 border-b border-b-[#cecfdd]'
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
                  onKeyDown={handleKeyDownSearch}
                  placeholder={tab === 'residents' ? 'Tìm kiếm theo Tên, Phòng, SĐT' : 'Tìm kiếm theo Tên, Vị trí, SĐT'}
                  className="w-full max-w-md px-3 py-2 border rounded-md"
                />
                <button
                  onClick={() => dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }))}
                  className="bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Tìm Kiếm
                </button>
                
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50 transition-colors ${activeFilters.length > 0 ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-gray-300 text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Bộ lọc
                  {activeFilters.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              {tab === 'residents' && (
                <>
                  <CSVImportButton importType="residents" />
                  <CreateResidentButton onSuccess={refreshList} />
                </>
              )}

              {tab === 'staff' && (
                <>
                  <CSVImportButton importType="staff" />
                  <CreateStaffButton onSuccess={refreshList} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 w-[72px] h-[72px]"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                <th className="text-left p-4">{tab === 'residents' ? 'Tên Cư Dân' : 'Tên Nhân Sự'}</th>
                <th className="text-left p-4">{tab === 'residents' ? 'Phòng' : 'Role'}</th>
                <th className="text-left p-4">Số Điện Thoại</th>
                <th className="text-left p-4">Trạng Thái</th>
                <th className="text-left p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Đang tải...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-6 text-center text-red-600">{error}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Không tìm thấy kết quả</td></tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className=" pl-[28px] w-[72px] h-[72px]">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => handleSelectOne(u.id)}
                      />
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                         {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : null}
                      </div>
                      <div>
                        <div className="font-medium">{u.fullName}</div>
                      </div>
                    </td>
                    <td className="p-4">
                        {tab === 'residents' 
                            ? (u.apartment?.roomNumber || u.apartment?.floorNumber || '---')
                            : u.role?.roleName
                        }
                    </td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${Number(u.status) === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {Number(u.status) === 1 ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(u.id)}
                          className="p-2 bg-white border rounded hover:bg-gray-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 bg-white border rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                          title={tab === 'residents' ? "Xóa cư dân" : "Xóa nhân viên"}
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
        
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 mt-5 rounded text-white transition
            ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Xóa đã chọn ({selectedIds.length})
        </button>

        <div className="mt-4 flex items-center justify-center gap-1 text-sm">
             <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50">&lt;</button>
             <span className="px-2 text-gray-600">Trang {page} / {Math.ceil(total / pageSize)}</span>
             <button onClick={() => onPage(Math.min(Math.ceil(total / pageSize), page + 1))} disabled={page === Math.ceil(total / pageSize)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </div>
  )
}

export default UsersPage