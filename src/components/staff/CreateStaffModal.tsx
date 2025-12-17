// components/staff/CreateStaffModal.tsx
import { FC, useState, useRef, ChangeEvent, useEffect } from 'react';
import { X, Upload, User, Phone, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createStaff, resetCreateStatus } from '../../store/staffSlice';
import { fetchRoles } from '../../store/roleSlice';
interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback khi tạo thành công
}



export const CreateStaffModal: FC<CreateStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const { createStatus, createMessage, error } = useAppSelector((state) => state.staff);
  const { roles } = useAppSelector((state) => state.roles || { roles: [] });
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    roleId: 3, // Mặc định là Lễ tân
    status: 1,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);

    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  };

  const normalizePhone = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Reset form khi modal mở
  useEffect(() => {
    if (isOpen) {
      resetForm();
      dispatch(resetCreateStatus());
    }
  }, [isOpen, dispatch]);

  // Xử lý khi tạo thành công
  useEffect(() => {
    if (createStatus === 'success') {
      // Tự động đóng modal sau 2 giây
      const timer = setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [createStatus, onSuccess]);

  if (!isOpen) return null;



  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      roleId: 3,
      status: 1,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }

    const rawPhone = normalizePhone(formData.phone);

    if (!rawPhone) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(0\d{9})$/.test(rawPhone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }


    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.roleId) {
      errors.roleId = 'Vai trò là bắt buộc';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý thay đổi input
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhone(value);

      setFormData(prev => ({
        ...prev,
        phone: formatted
      }));

      if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: '' }));
      }

      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' ? Number(value) : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Xử lý chọn file avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra file type và size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({
        ...prev,
        avatar: 'Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'
      }));
      return;
    }

    if (file.size > maxSize) {
      setFormErrors(prev => ({
        ...prev,
        avatar: 'File ảnh không được vượt quá 5MB'
      }));
      return;
    }

    setAvatarFile(file);
    setFormErrors(prev => ({ ...prev, avatar: '' }));

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Xóa avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        phone: normalizePhone(formData.phone),
        avatar: avatarFile || undefined,
        roleId: Number(formData.roleId),
      };


      await dispatch(createStaff(payload)).unwrap();
    } catch (error) {
      console.error('Lỗi tạo nhân viên:', error);
    }
  };

  // Đóng modal
  const handleClose = () => {
    if (createStatus === 'loading') {
      if (!window.confirm('Đang tạo nhân viên. Bạn có chắc muốn hủy?')) {
        return;
      }
    }

    resetForm();
    dispatch(resetCreateStatus());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Thêm nhân viên mới
          </h2>
          <button
            onClick={handleClose}
            disabled={createStatus === 'loading'}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Status Message */}
            {createStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{createMessage}</span>
                </div>
              </div>
            )}

            {createStatus === 'failed' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error || createMessage}</span>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Họ và tên nhân viên *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={createStatus === 'loading'}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                placeholder="Nhập họ và tên"
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Số điện thoại đăng nhập *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={createStatus === 'loading'}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                placeholder="Nhập số điện thoại"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={createStatus === 'loading'}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
                placeholder="Nhập email"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4" />
                Ảnh đại diện nhân viên
                <span className="text-xs text-gray-500 ml-auto">
                  (jpg, png, webp, gif - tối đa 5MB)
                </span>
              </label>

              {avatarPreview ? (
                <div className="mb-3">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={createStatus === 'loading'}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleAvatarChange}
                    disabled={createStatus === 'loading'}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={createStatus === 'loading'}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Choose File
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    Chưa chọn file nào
                  </p>
                </div>
              )}

              {formErrors.avatar && (
                <p className="mt-1 text-sm text-red-600">{formErrors.avatar}</p>
              )}
            </div>


            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Vai trò *
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                disabled={createStatus === 'loading'}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.roleId ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100`}
              >
                <option value="">Chọn vai trò</option>
                {/* 5. Map dữ liệu từ Redux store */}
                {roles && roles.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              {formErrors.roleId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.roleId}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={createStatus === 'loading'}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createStatus === 'loading'}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createStatus === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </span>
                ) : 'Tạo nhân viên'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};