import type { FC } from 'react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { ResidentModal } from '../../components/residents/ResidentForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, setPage } from '../../store/usersSlice'
import { deleteStaff } from '../../store/staffSlice';
import { CSVImportButton } from "../../components/CSVImport";

import { FilterModal, FilterConfig, FilterCondition } from '../../components/filter/FilterModal';
import { deleteResident } from '../../store/residentsSlice';

import { StaffModal } from '../../components/staff/StaffModal';
import usersService from '../../services/usersService';
import { fetchRoles } from '../../store/roleSlice';
import { transformFilters } from '../../utils/filterUtils';
import { Plus } from "lucide-react";
import { API_BASE_URL } from '../../utils/url';
import { useLocale } from '../../i18n/LocaleContext';
type TabType = 'residents' | 'staff'

export const UsersPage: FC = () => {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabType>('staff')
  const [query, setQuery] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [modalState, setModalState] = useState<{ isOpen: boolean; residentId: number | null }>({
    isOpen: false,
    residentId: null
  });
  const handleOpenCreate = () => setModalState({ isOpen: true, residentId: null });
  const handleOpenEdit = (id: number) => setModalState({ isOpen: true, residentId: id });
  const handleCloseModal = () => setModalState({ isOpen: false, residentId: null });
  const [staffModalState, setStaffModalState] = useState<{ isOpen: boolean; staffId: number | null }>({
    isOpen: false,
    staffId: null
  });
  const handleOpenStaffCreate = () => setStaffModalState({ isOpen: true, staffId: null });
  const handleOpenStaffEdit = (id: number) => setStaffModalState({ isOpen: true, staffId: id });
  const handleCloseStaffModal = () => setStaffModalState({ isOpen: false, staffId: null });
  const [serverSuggestions, setServerSuggestions] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const searchTimeoutRef = useRef<any>(null);
  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, status, error } = useAppSelector((s) => s.users)
  const { roles } = useAppSelector((state) => state.roles || { roles: [] });
  useEffect(() => {
    if (tab === 'staff' && roles.length === 0) {
      dispatch(fetchRoles());
    }
  }, [dispatch, tab, roles.length]);
  const residentFields: FilterConfig[] = useMemo(() => [
    { key: 'fullName', label: t.users.filterFields.residentName, type: 'string' },
    { key: 'phone', label: t.users.filterFields.phone, type: 'string' },
    { key: 'room', label: t.users.filterFields.room, type: 'string' },
    { key: 'status', label: t.users.filterFields.status, type: 'select', options: [{ label: t.common.active, value: 1 }, { label: t.common.inactive, value: 0 }] },
    { key: 'joinDate', label: t.users.filterFields.joinDate, type: 'date' },
  ], [t]);

  const staffFields: FilterConfig[] = useMemo(() => {
    const roleOptions = roles.map((role: any) => ({
      label: role.roleName,
      value: role.id
    }));

    return [
      { key: 'fullName', label: t.users.filterFields.staffName, type: 'string' },
      { key: 'phone', label: t.users.filterFields.phone, type: 'string' },
      {
        key: 'roleId',
        label: t.users.filterFields.role,
        type: 'select',
        options: roleOptions
      },
      { key: 'status', label: t.users.filterFields.status, type: 'select', options: [{ label: t.common.active, value: 1 }, { label: t.common.inactive, value: 0 }] },
      { key: 'createdAt', label: t.users.filterFields.createdAt, type: 'date' },
    ];
  }, [roles, t]);

  const currentFields = tab === 'residents' ? residentFields : staffFields;



  const refreshList = () => {
    dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }));
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
      ? t.users.confirmDeleteStaff
      : t.users.confirmDeleteResident;

    if (window.confirm(confirmMessage)) {
      try {
        if (isStaff) {
          await dispatch(deleteStaff(id)).unwrap();
        } else {
          await dispatch(deleteResident(id)).unwrap();
        }
        alert(t.common.deleteSuccess);
        refreshList();
      } catch (err: any) {
        alert(t.common.deleteFailed + ": " + (err || t.common.deleteFailed));
      }
    }
  }



  const handleApplyFilter = (filters: FilterCondition[]) => {
    setActiveFilters(filters);
    const cleanPayload = transformFilters(filters);
    dispatch(fetchUsers({
      type: tab,
      query,
      page: 1,
      pageSize,
      filters: cleanPayload
    }));
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
    if (!window.confirm(t.users.deleteSelectedItems.replace('{count}', selectedIds.length.toString()))) return

    try {
      await Promise.all(
        selectedIds.map(id => {
          return tab === 'staff'
            ? dispatch(deleteStaff(id)).unwrap()
            : dispatch(deleteResident(id)).unwrap()
        })
      );

      alert(t.users.deleteSuccess.replace('{count}', selectedIds.length.toString()));
      refreshList();
    } catch (error) {
      alert(t.users.deleteError);
      refreshList();
    }
  }
  const handleFilterSearch = (key: string, value: string) => {

    if (!value.trim()) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {

        const data = await usersService.searchSuggestions({
          type: tab, // 'residents' hoặc 'staff'
          field: key, // ví dụ: 'fullName'
          keyword: value // ví dụ: 'Hương'
        });

        if (data && data.items) {
          const newOptions = data.items.map((item: any) => {
            if (key === 'room') return item.apartment?.roomNumber;
            if (key === 'roleId') return item.role?.roleName;
            return item[key];
          }).filter(Boolean);

          setServerSuggestions(prev => ({
            ...prev,
            [key]: Array.from(new Set(newOptions)) as string[]
          }));
        }

      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 500);
  };
  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }));
    }
  };
  const formatPhoneDisplay = (phone: string | undefined | null) => {
    if (!phone) return '---';

    // Loại bỏ các ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');

    // Format theo dạng 0000-000-000 (nếu đủ 10 số)
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    // Hoặc trả về nguyên bản nếu không khớp format chuẩn
    return phone;
  };
  return (
    <div className='overflow-auto'>
      <StaffModal
        isOpen={staffModalState.isOpen}
        staffId={staffModalState.staffId}
        onClose={handleCloseStaffModal}
        onSuccess={refreshList}
      />
      <ResidentModal
        isOpen={modalState.isOpen}
        residentId={modalState.residentId}
        onClose={handleCloseModal}
        onSuccess={refreshList}
      />
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
        availableFields={currentFields}
        tagData={serverSuggestions}
        onSearchChange={handleFilterSearch}
        initialFilters={activeFilters}
        onQuickSearch={(q: string) => {
          setQuery(q);
          dispatch(fetchUsers({
            type: tab,
            query: q,
            page: 1,
            pageSize,
          }));
        }}
      />


      <div className="flex-1 overflow-auto ">

        <div className="flex gap-4 border-b border-[#cecfdd] mb-3">
          <button
            onClick={() => setTab('residents')}
            className={`pb-3 transition-colors px-3 py-3 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'residents'
              ? 'text-indigo-700 font-bold border-b-2 border-b-indigo-700'
              : 'text-gray-600 hover:text-gray-900 border-b border-b-[#cecfdd]'
              }`}
          >
            {t.users.residentsList}
          </button>
          <button
            onClick={() => setTab('staff')}
            className={`pb-3 transition-colors px-3 py-3 border-t border-x border-[#cecfdd] rounded-t-lg ${tab === 'staff'
              ? 'text-indigo-700 font-bold border-b-2 border-b-indigo-700'
              : 'text-gray-600 hover:text-gray-900 border-b border-b-[#cecfdd]'
              }`}
          >
            {t.users.staffList}
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
                  placeholder={t.users.searchPlaceholder}
                  className="w-full max-w-md px-3 py-2 border border-[#cecfdd]
 rounded-md"
                />
                <button
                  onClick={() => dispatch(fetchUsers({ type: tab, query, page: 1, pageSize }))}
                  className="bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  {t.common.search}
                </button>

                <button
                  onClick={() => setIsFilterOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50 transition-colors ${activeFilters.length > 0 ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-gray-300 text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {t.common.filter}
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
                  <CSVImportButton onSuccess={refreshList} importType="residents" />

                  <button className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2"
                    onClick={handleOpenCreate}

                  ><Plus className="w-4 h-4" />{t.users.addResident}</button>
                </>
              )}

              {tab === 'staff' && (
                <>
                  <CSVImportButton onSuccess={refreshList} importType="staff" />
                  <button
                    className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2"
                    onClick={handleOpenStaffCreate}
                  >
                    <Plus className="w-4 h-4" />{t.users.addStaff}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 my-1 rounded text-white transition
    ${selectedIds.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'}`}
        >
          {t.common.deleteSelected} ({selectedIds.length})
        </button>
        <div className="bg-white border rounded shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 w-[72px] h-[72px]"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                <th className="text-left p-4">{tab === 'residents' ? t.users.residentName : t.users.staffName}</th>
                <th className="text-left p-4">{tab === 'residents' ? t.users.room : t.users.role}</th>
                <th className="text-left p-4">{t.users.phone}</th>
                <th className="text-left p-4">{t.common.status}</th>
                <th className="text-left p-4">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-6 text-center text-red-600">{error}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">{t.common.noResults}</td></tr>
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
                        {u.avatar && (
                          <img
                            src={`${API_BASE_URL}${u.avatar}`}
                            className="w-full h-full object-cover"
                            alt="avatar"
                          />
                        )} </div>
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
                    <td className="p-4">{formatPhoneDisplay(u.phone)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${Number(u.status) === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {Number(u.status) === 1 ? t.common.active : t.common.inactive}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          // Mở Modal Edit
                          onClick={() => {
                            if (tab === 'residents') handleOpenEdit(u.id);
                            else handleOpenStaffEdit(u.id);
                          }}
                          className="p-2 bg-white border rounded hover:bg-gray-50 transition-colors"
                          title={t.common.edit}
                        >
                          {/* <Pencil className="w-4 h-4 text-indigo-500" /> */}
                          ✏️

                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 bg-white border rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                          title={tab === 'residents' ? t.users.deleteResident : t.users.deleteStaff}
                        >
                          {/* <Trash2 className="w-4 h-4 text-red-500" /> */}
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



        <div className="mt-4 flex items-center justify-center gap-1 text-sm">
          <button
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
          >
            &lt;
          </button>

          {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={i}
                onClick={() => onPage(pageNum)}
                className={`px-3 py-1 rounded ${page === pageNum
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {Math.ceil(total / pageSize) > 5 && (
            <>
              <span className="px-2 text-gray-500">...</span>
              <button
                onClick={() => onPage(Math.ceil(total / pageSize))}
                className={`px-3 py-1 rounded ${page === Math.ceil(total / pageSize)
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {Math.ceil(total / pageSize)}
              </button>
            </>
          )}

          <button
            onClick={() => onPage(Math.min(Math.ceil(total / pageSize), page + 1))}
            disabled={page === Math.ceil(total / pageSize)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}

export default UsersPage