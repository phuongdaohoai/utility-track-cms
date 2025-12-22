import { FC, useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Upload, User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateStaff, resetUpdateStatus, fetchStaffById, deleteStaff } from '../../store/staffSlice';
import { fetchRoles } from '../../store/roleSlice';

import { API_BASE_URL } from '../../utils/url';

interface EditStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: number | null;
    onSuccess?: () => void;
}

export const EditStaffModal: FC<EditStaffModalProps> = ({
    isOpen,
    onClose,
    staffId,
    onSuccess
}) => {
    const dispatch = useAppDispatch();

    const { roles } = useAppSelector((state) => state.roles || { roles: [] });
    const { updateStatus, error, currentStaff, loading } = useAppSelector((state) => state.staff);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        roleId: '',
        status: 1,
        version: 0,
        password: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (isOpen && staffId) {
            dispatch(fetchRoles());
            dispatch(fetchStaffById(staffId));
            dispatch(resetUpdateStatus());
            setFormErrors({});
        }
    }, [isOpen, staffId, dispatch]);

    useEffect(() => {
        if (currentStaff && isOpen) {
            setFormData({
                fullName: currentStaff.fullName || '',
                phone: formatPhoneNumber(currentStaff.phone || ''),
                email: currentStaff.email || '',
                roleId: currentStaff.role?.id.toString() || '',
                status: currentStaff.status ?? 1,
                version: currentStaff.version ?? 0,
                password: '',
            });

            if (typeof currentStaff.avatar === 'string') {
                setAvatarPreview(
                    currentStaff.avatar.startsWith('http')
                        ? currentStaff.avatar
                        : `${API_BASE_URL}${currentStaff.avatar}`
                );
            } else if (currentStaff.avatar instanceof File) {
                setAvatarPreview(URL.createObjectURL(currentStaff.avatar));
            } else {
                setAvatarPreview(null);
            }
        }
    }, [currentStaff, isOpen]);


    useEffect(() => {
        if (updateStatus === 'success') {
            const timer = setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [updateStatus, onClose, onSuccess]);


    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const cleanPhone = formData.phone.replace(/\D/g, '');

        if (!formData.fullName.trim()) {
            errors.fullName = 'Họ tên là bắt buộc';
        }


        if (!cleanPhone) {
            errors.phone = 'SĐT là bắt buộc';
        } else if (!/^(0|\+84)(\d{9})$/.test(cleanPhone)) {
            // Regex check: Bắt đầu bằng 0 hoặc +84, theo sau là 9 chữ số (tổng 10 số)
            errors.phone = 'SĐT không hợp lệ (VD: 0901-234-567)';
        }


        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }


        if (!formData.roleId) {
            errors.roleId = 'Vui lòng chọn vai trò';
        }
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }


        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        const rawValue = value.replace(/\D/g, '');

        if (rawValue.length > 10) return;

        const formattedValue = formatPhoneNumber(rawValue);

        setFormData(prev => ({ ...prev, phone: formattedValue }));


        if (formErrors.phone) {
            setFormErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File quá lớn (Max 5MB)");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async () => {
        if (!staffId) return;
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.")) {
            try {
                await dispatch(deleteStaff(staffId)).unwrap();
                onClose();
                if (onSuccess) onSuccess();
            } catch (err) {
                alert("Xóa thất bại");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffId || !validateForm()) return;

        const payload = {
            staffId,
            fullName: formData.fullName,
            phone: formData.phone.replace(/\D/g, ''),
            email: formData.email,
            roleId: Number(formData.roleId),
            status: Number(formData.status),
            version: Number(formData.version), // Gửi version lên server
            avatar: avatarFile || undefined,
            password: formData.password || undefined
        };

        await dispatch(updateStaff(payload));
    };

    if (!isOpen) return null;

    // Hàm format số điện thoại: 0901234567 -> 0901-234-567
    const formatPhoneNumber = (value: string) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, ''); // Chỉ giữ lại số
        const phoneNumberLength = phoneNumber.length;

        if (phoneNumberLength < 5) return phoneNumber;
        if (phoneNumberLength < 8) {
            return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
        }
        return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 10)}`;
    };

    console.log('Rendering EditStaffModal with staffId:', formData.roleId);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#333570]">Chỉnh sửa nhân sự</h2>
                        <p className="text-sm text-gray-500">Cập nhật thông tin và phân quyền</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Loading State */}
                {loading && !currentStaff ? (
                    <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 flex-1">

                        {/* Notifications */}
                        {updateStatus === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 border border-green-200">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Cập nhật thành công!</span>
                            </div>
                        )}
                        {updateStatus === 'failed' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">{error || "Có lỗi xảy ra"}</span>
                            </div>
                        )}

                        {/* Input Ẩn chứa Version */}
                        <input type="hidden" name="version" value={formData.version} />

                        <div className="flex flex-col md:flex-row gap-8">

                            {/* CỘT TRÁI: AVATAR */}
                            <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                                <User className="w-16 h-16" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                                        title="Đổi ảnh"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>

                            {/* CỘT PHẢI: FORM FIELDS */}
                            <div className="w-full md:w-2/3 space-y-5">

                                {/* FullName */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="Nguyễn Văn A"
                                    />
                                    {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                                </div>

                                {/* Phone & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                // Thêm class hiển thị lỗi đỏ như hình
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all 
                          ${formErrors.phone
                                                        ? 'border-red-500 ring-1 ring-red-200 bg-red-50 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-indigo-500'}`}
                                                placeholder="0000-000-000"
                                            />
                                        </div>
                                        {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-indigo-500'}`}
                                                placeholder="abc@example.com"
                                            />
                                        </div>
                                        {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu mới <span className="text-gray-400 font-normal text-xs">(Bỏ trống nếu không đổi)</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                            className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-indigo-500'
                                                }`} placeholder="••••••"
                                        />
                                        <button
                                            type="button" // Quan trọng: type="button" để không submit form
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" /> // Icon mắt gạch chéo (khi đang hiện)
                                            ) : (
                                                <Eye className="w-4 h-4" />    // Icon mắt thường (khi đang ẩn)
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                                </div>
                                {/* Role & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vai trò <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <select
                                                name="roleId"
                                                value={formData.roleId}
                                                onChange={handleInputChange}
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${formErrors.roleId ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">Chọn vai trò</option>
                                                {roles.map((r: any) => (
                                                    <option key={r.id} value={r.id}>{r.roleName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {formErrors.roleId && <p className="text-xs text-red-500 mt-1">{formErrors.roleId}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value={1}>Hoạt động</option>
                                            <option value={0}>Đã khóa</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Xóa nhân viên
                            </button>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateStatus === 'loading'}
                                    className="px-6 py-2 bg-[#333570] text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {updateStatus === 'loading' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};