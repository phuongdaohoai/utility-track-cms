import { FC, useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Upload, User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  fetchStaffById, 
  resetCreateStatus, 
  resetUpdateStatus 
} from '../../store/staffSlice';
import { fetchRoles } from '../../store/roleSlice';

import { API_BASE_URL } from '../../utils/url';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: number | null; // null = Create Mode, number = Edit Mode
  onSuccess?: () => void;
}

export const StaffModal: FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffId,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { roles } = useAppSelector((state) => state.roles || { roles: [] });
  const { 
    currentStaff, 
    loading, 
    createStatus, 
    updateStatus, 
    error: reduxError 
  } = useAppSelector((state) => state.staff);

  const isEditMode = !!staffId;
  const currentStatus = isEditMode ? updateStatus : createStatus;
  const isLoadingAction = currentStatus === 'loading';
  const isSuccess = currentStatus === 'success';
  const isFailed = currentStatus === 'failed';

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    roleId: '',
    status: 1,
    version: 0,
    password: '',
    avatar: '',
  });

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 8) return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 10)}`;
  };

  // --- 1. Reset & Fetch Data ---
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRoles());
      
      // Reset status để tránh hiện lại thông báo cũ
      if (isEditMode) dispatch(resetUpdateStatus());
      else dispatch(resetCreateStatus());

      setFormErrors({});
      setAvatarFile(null);
      setAvatarPreview(null);

      if (isEditMode && staffId) {
        dispatch(fetchStaffById(staffId));
      } else {
        setFormData({
          fullName: '', phone: '', email: '', roleId: '', status: 1, 
          version: 0, password: '', avatar: ''
        });
      }
    }
  }, [isOpen, staffId, isEditMode, dispatch]);

  // --- 2. Fill Data khi Edit ---
  useEffect(() => {
    if (isEditMode && currentStaff && isOpen) {
      setFormData({
        fullName: currentStaff.fullName || '',
        phone: formatPhoneNumber(currentStaff.phone || ''),
        email: currentStaff.email || '',
        roleId: currentStaff.role?.id.toString() || '',
        status: currentStaff.status ?? 1,
        version: currentStaff.version ?? 0,
        password: '',
        avatar: (typeof currentStaff.avatar === 'string') ? currentStaff.avatar : '',
      });

      if (currentStaff.avatar && typeof currentStaff.avatar === 'string') {
         const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
         const cleanAvatarPath = currentStaff.avatar.startsWith('/') ? currentStaff.avatar : `/${currentStaff.avatar}`;
         const url = currentStaff.avatar.startsWith('http') 
            ? currentStaff.avatar 
            : `${cleanBaseUrl}${cleanAvatarPath}`;
         setAvatarPreview(url);
      } else {
         setAvatarPreview(null);
      }
    }
  }, [currentStaff, isEditMode, isOpen]);

  // --- 3. Xử lý Thành công (QUAN TRỌNG) ---
  useEffect(() => {
    if (isSuccess) {
      // 🟢 HIỆN DẤU HIỆU THÀNH CÔNG: Dùng Alert hoặc để Banner hiển thị 1 lúc
      // Cách 1: Dùng Alert (Người dùng phải bấm OK mới đóng)
      // alert(isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      
      // Cách 2: Tự động đóng sau 1.5s (Kết hợp với Banner xanh ở dưới)
      const timer = setTimeout(() => {
        // Reset status
        if (isEditMode) dispatch(resetUpdateStatus());
        else dispatch(resetCreateStatus());
        
        // Gọi callback refresh list
        if (onSuccess) onSuccess();
        
        // Đóng modal
        onClose();
      }, 1500); 

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isEditMode, dispatch, onClose, onSuccess]);

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const rawValue = value.replace(/\D/g, '');
    if (rawValue.length > 10) return;
    const formattedValue = formatPhoneNumber(rawValue);
    setFormData(prev => ({ ...prev, phone: formattedValue }));
    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
  };

 const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('File tối đa 5MB');
    return;
  }

  setAvatarFile(file);
  setAvatarPreview(URL.createObjectURL(file));
};

  const handleDelete = async () => {
    if (!staffId) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await dispatch(deleteStaff(staffId)).unwrap();
        dispatch(resetUpdateStatus());
        onClose();
        if (onSuccess) onSuccess();
        alert("Xóa thành công!"); // Thêm thông báo
      } catch (err) { alert("Xóa thất bại"); }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanPhone = formData.phone.replace(/\D/g, '');

    if (!formData.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
    if (!cleanPhone) errors.phone = 'SĐT là bắt buộc';
    else if (!/^(0|\+84)(\d{9})$/.test(cleanPhone)) errors.phone = 'SĐT không hợp lệ';

    if (!formData.email.trim()) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ';

    if (!formData.roleId) errors.roleId = 'Vui lòng chọn vai trò';
    
    if (!isEditMode && !formData.password) errors.password = 'Mật khẩu là bắt buộc';
    if (formData.password && formData.password.length < 6) errors.password = 'Mật khẩu > 6 ký tự';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    fullName: formData.fullName,
    phone: formData.phone.replace(/\D/g, ''),
    email: formData.email,
    roleId: Number(formData.roleId),
    status: Number(formData.status),
    password: formData.password || undefined,
    avatar: formData.avatar || undefined, // avatar cũ (edit)
  };

  if (isEditMode && staffId) {
    dispatch(updateStaff({
      staffData: {
        ...payload,
        staffId,
        version: Number(formData.version),
      },
      avatarFile, // 🔥 LUÔN TRUYỀN FILE
    }));
  } else {
    dispatch(createStaff({
      staffData: payload,
      avatarFile, // 🔥 LUÔN TRUYỀN FILE
    }));
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-[#333570]">
                {isEditMode ? 'Chỉnh sửa nhân sự' : 'Thêm Nhân sự mới'}
            </h2>
            <p className="text-sm text-gray-500">
                {isEditMode ? 'Cập nhật thông tin' : 'Nhập thông tin nhân sự mới'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {isEditMode && loading && !currentStaff ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 flex-1">
                
                {/* 🟢 DẤU HIỆU THÀNH CÔNG (Banner Xanh) */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 border border-green-200 shadow-sm animate-fade-in">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold text-lg">
                            {isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!'}
                        </span>
                    </div>
                )}

                {/* 🔴 DẤU HIỆU LỖI (Banner Đỏ) */}
                {isFailed && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{reduxError || "Có lỗi xảy ra, vui lòng thử lại."}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* AVATAR */}
                    <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-300">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>

                    {/* FORM FIELDS */}
                    <div className="w-full md:w-2/3 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                            <input name="fullName" value={formData.fullName} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                            {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                        </div>
                        
                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SĐT <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input name="phone" value={formData.phone} onChange={handlePhoneChange} className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} placeholder="0000-000-000" />
                                </div>
                                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} placeholder="abc@example.com" />
                                </div>
                                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu {isEditMode && <span className="text-gray-400 text-xs font-normal">(để trống nếu không đổi)</span>}
                                {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    autoComplete="new-password"
                                    className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.password ? 'border-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} 
                                    placeholder="••••••" 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select name="roleId" value={formData.roleId} onChange={handleInputChange} className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none bg-white ${formErrors.roleId ? 'border-red-500' : 'border-gray-300'}`}>
                                        <option value="">Chọn vai trò</option>
                                        {roles.map((r: any) => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                                    </select>
                                </div>
                                {formErrors.roleId && <p className="text-xs text-red-500 mt-1">{formErrors.roleId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Đã khóa</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                    {isEditMode ? (
                        <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Xóa nhân viên
                        </button>
                    ) : <div></div>}
                    
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy bỏ</button>
                        <button type="submit" disabled={isLoadingAction} className="px-6 py-2 bg-[#333570] text-white rounded-lg hover:bg-indigo-800 disabled:opacity-70 flex items-center gap-2">
                            {isLoadingAction && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            {isEditMode ? 'Lưu thay đổi' : 'Thêm mới'}
                        </button>
                    </div>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};