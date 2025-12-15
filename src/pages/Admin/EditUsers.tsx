import React, { useState, ChangeEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useParams, useNavigate } from "react-router-dom";
import { fetchStaffById, updateStaff, resetUpdateStatus, deleteStaff } from '../../store/staffSlice'; // Import actions

type UserStatus = "active" | "inactive" | "suspended";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfileEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const { currentStaff, loading, updateStatus } = useAppSelector((state) => state.staff);
  const { name, role } = useAppSelector((state) => state.auth.user || { name: 'User', role: 'Guest' });


  const [formData, setFormData] = useState({
    fullName: "",
    roleId: "",
    phone: "",
    roleName: "",
    status: "active" as UserStatus,
    avatar: "https://via.placeholder.com/150",
  });


  useEffect(() => {
    if (id) {
      dispatch(fetchStaffById(id));
    }
  }, [id, dispatch]);


  useEffect(() => {
    if (currentStaff) {
      setFormData({
        fullName: currentStaff.fullName || "",
        phone: currentStaff.phone || "",
        roleId: currentStaff.roleId?.toString() || "",
        roleName: currentStaff.role?.roleName || "",
        status: currentStaff.status === 1 ? "active" : "inactive",
        avatar: currentStaff.avatar
          ? (currentStaff.avatar.startsWith('http') ? currentStaff.avatar : `${API_BASE_URL}/${currentStaff.avatar}`)
          : "https://via.placeholder.com/150"
      });
    }
  }, [currentStaff]);

  useEffect(() => {
    if (updateStatus === 'success') {
      alert("Cập nhật thành công!");
      dispatch(resetUpdateStatus()); // Reset lại để lần sau ấn tiếp không bị alert
      navigate('/admin/users'); // Hoặc ở lại trang tùy logic
    } else if (updateStatus === 'failed') {
      alert("Chức năng chưa được phát triển. Vui lòng thử lại.");
      dispatch(resetUpdateStatus());
    }
  }, [updateStatus, dispatch, navigate]);


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;


    dispatch(updateStaff({
      staffId: Number(id),
      fullName: formData.fullName,
      phone: formData.phone,
      roleId: Number(formData.roleId),
      status: formData.status === 'active' ? 1 : 0
    }));
  };


  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  const handleDelete = async () => {
    if (!id) return;


    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.");

    if (isConfirmed) {
      try {

        await dispatch(deleteStaff(Number(id))).unwrap();


        alert("Đã xóa nhân viên thành công!");
        navigate('/admin/users');
      } catch (error) {
        alert("Xóa thất bại: " + (error || "Lỗi không xác định"));
      }
    }
  };
  return (
    <div className="">

        <header className="bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-semibold text-[#8889ab]">
            Quản lý Cư dân / <span className="text-[#333570] font-bold">Chi tiết nhân sự</span>
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

    <div className="bg-white rounded-b-lg border-2 border-gray-200 border-t-0 m-4 mt-7">
        <form onSubmit={handleSave} className="p-6">
          <div className="flex gap-6">

            {/* Cột trái: Avatar */}
            <div className="w-1/3 flex flex-col items-center gap-6">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <input
                id="avatar-upload" // Thêm ID để link với label
                type="file"
                accept="image/*"
                // onChange={}
                className="hidden"
              />

            
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer flex items-center gap-2 px-6 py-2 border border-indigo-900 text-indigo-900 bg-white rounded hover:bg-indigo-50 transition-colors font-medium shadow-sm"
              >
              
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                Update
              </label>
            </div>


            <div className="flex-1">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-center">

                <label className="text-sm text-gray-600">Họ Và Tên</label>
                <input
                  className="col-span-1 border-none bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />

                <label className="text-sm text-gray-600">Phòng</label>
                <input
                  className="col-span-1 border-none bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={formData.roleId}
                  onChange={(e) => handleChange('roleId', e.target.value)}
                />

                <label className="text-sm  text-gray-600">Số Điện Thoại</label>
                <input
                  className="col-span-1 border-none bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />

                <label className="text-sm text-gray-600">Trạng Thái</label>
                <select
                  className="col-span-1  rounded-md px-3 py-2 text-sm w-full"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">Hoạt Động</option>
                  <option value="inactive">Không Hoạt Động</option>
                </select>

                 <label className="text-sm text-gray-600">Vai Trò</label>
                <input
                  className="col-span-1 border-b-slate-500 rounded-md px-3 py-2 text-sm w-full"
                  value={formData.roleName}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="border-t mt-6 pt-4 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Xóa
                </button>
                <button
                  type="submit"
                  disabled={updateStatus === 'loading'}
                  className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-blue-300"
                >
                  {updateStatus === 'loading' ? 'Đang lưu...' : 'Lưu Thông Tin'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}