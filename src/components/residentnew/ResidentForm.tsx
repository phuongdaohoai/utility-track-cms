import { FC, useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Upload, User, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createResident, 
  updateResident, 
  deleteResident, 
  fetchResidentById, 
  resetResidentStatus 
} from '../../store/residentsSlice';
import { API_BASE_URL } from '../../utils/url';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentId?: number | null; // Optional: Có id là Edit, không có là Create
  onSuccess?: () => void;
}

export const ResidentModal: FC<ResidentModalProps> = ({
  isOpen,
  onClose,
  residentId,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lấy state chung từ Redux
  const { 
    currentResident, 
    loading, // Loading khi fetch data edit
    createStatus, 
    updateStatus, 
    error: reduxError 
  } = useAppSelector((state) => state.residents);

  // Xác định chế độ: Edit hay Create
  const isEditMode = !!residentId;
  const currentStatus = isEditMode ? updateStatus : createStatus;
  const isLoadingAction = currentStatus === 'loading';

  // State local
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Dùng cho Create
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    citizenCard: '',
    gender: 'Nam',
    birthday: '',
    apartmentId: 0,
    qrCode: '',
    faceIdData: '',
    status: 1,
    avatar: "", // Dùng cho Edit (URL string)
    version: 0,
  });

  // --- Helper: Format phone ---
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 8) return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 10)}`;
  };

  // --- Effects ---

  // 1. Reset & Fetch data khi mở Modal
  useEffect(() => {
    if (isOpen) {
      dispatch(resetResidentStatus());
      setFormErrors({});
      setAvatarFile(null);
      
      if (isEditMode && residentId) {
        dispatch(fetchResidentById(residentId));
      } else {
        // Reset form cho chế độ Create
        setFormData({
          fullName: '', phone: '', email: '', citizenCard: '', gender: 'Nam',
          birthday: '', apartmentId: 0, qrCode: '', faceIdData: '', status: 1,
          avatar: "", version: 0
        });
        setAvatarPreview(null);
      }
    }
  }, [isOpen, residentId, isEditMode, dispatch]);

  // 2. Fill data khi Edit (Fetch thành công)
  useEffect(() => {
    if (isEditMode && currentResident && isOpen) {
      setFormData({
        fullName: currentResident.fullName || '',
        phone: formatPhoneNumber(currentResident.phone || ''),
        email: currentResident.email || '',
        citizenCard: currentResident.citizenCard || '',
        gender: currentResident.gender || 'Nam',
        birthday: currentResident.birthday ? currentResident.birthday.split('T')[0] : '',
        apartmentId: currentResident.apartment?.floorNumber || 0,
        qrCode: currentResident.qrCode || '',
        faceIdData: currentResident.faceIdData || '',
        status: currentResident.status ?? 1,
        version: currentResident.version ?? 0,
        avatar: currentResident.avatar || "",
      });
      // Set preview ảnh nếu có
      if (currentResident.avatar) {
         // Nếu avatar là full URL thì dùng luôn, không thì nối API_BASE_URL
         const url = currentResident.avatar.startsWith('http') 
            ? currentResident.avatar 
            : `${API_BASE_URL}${currentResident.avatar}`;
         setAvatarPreview(url);
      } else {
         setAvatarPreview(null);
      }
    }
  }, [currentResident, isEditMode, isOpen]);

  // 3. Xử lý thành công (Create hoặc Update xong)
  useEffect(() => {
    if (currentStatus === 'success') {
      const timer = setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, onClose, onSuccess]);

  // --- Handlers ---

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const rawValue = value.replace(/\D/g, '');
    if (rawValue.length > 10) return;
    const formattedValue = formatPhoneNumber(rawValue);
    setFormData(prev => ({ ...prev, phone: formattedValue }));
    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditMode) {
      // Logic cũ của Edit: Upload ngay lập tức
      const formDataUpload = new FormData();
      formDataUpload.append('file', file); // Lưu ý: check lại backend nhận 'file' hay 'avatar'
      const token = localStorage.getItem('accessToken');
      
      try {
        const res = await fetch(`${API_BASE_URL}/upload/avatar`, {
            method: 'POST',
            headers: { Authorization: token ? `Bearer ${token}` : '' },
            body: formDataUpload,
        });
        const json = await res.json();
        if (res.ok) {
            setAvatarPreview(`${API_BASE_URL}${json.data.url}`);
            setFormData(prev => ({ ...prev, avatar: json.data.url }));
        } else {
            alert('Upload ảnh thất bại');
        }
      } catch (err) { alert('Lỗi upload ảnh'); }

    } else {
      // Logic cũ của Create: Chỉ lưu file vào state, upload sau khi submit
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async () => {
    if (!residentId) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa cư dân này?")) {
      try {
        await dispatch(deleteResident(residentId)).unwrap();
        onClose();
        if (onSuccess) onSuccess();
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanPhone = formData.phone.replace(/\D/g, '');

    if (!formData.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
    if (!cleanPhone) errors.phone = 'SĐT là bắt buộc';
    else if (!/^(0|\+84)(\d{9})$/.test(cleanPhone)) errors.phone = 'SĐT không hợp lệ (10 số)';

    if (!formData.citizenCard.trim()) errors.citizenCard = 'CCCD là bắt buộc';
    else if (formData.citizenCard.length !== 12) errors.citizenCard = 'CCCD phải đúng 12 số';

    if (!formData.birthday) errors.birthday = 'Ngày sinh là bắt buộc';
    // if (!formData.email.trim()) errors.email = 'Email là bắt buộc';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payloadRaw = {
      fullName: formData.fullName,
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email,
      citizenCard: formData.citizenCard,
      gender: formData.gender,
      birthday: formData.birthday,
      apartmentId: Number(formData.apartmentId),
      status: Number(formData.status),
      qrCode: formData.qrCode,
      faceIdData: formData.faceIdData,
      roleId: 3 // Default role for resident
    };

    if (isEditMode && residentId) {
      // Update Logic
      const updateData = {
          ...payloadRaw,
          avatar: formData.avatar, // String URL
          version: Number(formData.version),
      };
      dispatch(updateResident({ id: residentId, data: updateData }));
    } else {
      // Create Logic
      dispatch(createResident({ residentData: payloadRaw, avatarFile }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-[#333570]">
                {isEditMode ? 'Chỉnh sửa cư dân' : 'Thêm Mới Cư Dân'}
            </h2>
            <p className="text-sm text-gray-500">
                {isEditMode ? 'Cập nhật thông tin chi tiết' : 'Nhập thông tin cư dân mới'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State (chỉ khi Edit mà chưa có data) */}
        {isEditMode && loading && !currentResident ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 flex-1">
                
                {/* Notifications */}
                {currentStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 border border-green-200">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">{isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!'}</span>
                    </div>
                )}
                {currentStatus === 'failed' && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{reduxError || "Có lỗi xảy ra"}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT COLUMN: AVATAR */}
                    <div className="w-full md:w-1/4 flex flex-col items-center gap-4">
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
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-900">{formData.fullName || "Tên Cư Dân"}</h3>
                            {isEditMode && <p className="text-xs text-gray-500">ID: {residentId}</p>}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FORM FIELDS */}
                    <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Form Inputs (Dùng chung cho cả 2) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nguyễn Văn A"
                            />
                            {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0000-000-000"
                            />
                            {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CCCD (12 số) <span className="text-red-500">*</span></label>
                            <input
                                name="citizenCard"
                                value={formData.citizenCard}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.citizenCard ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="001234567890"
                            />
                            {formErrors.citizenCard && <p className="text-xs text-red-500 mt-1">{formErrors.citizenCard}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${formErrors.birthday ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.birthday && <p className="text-xs text-red-500 mt-1">{formErrors.birthday}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã căn hộ</label>
                            <input
                                type="number"
                                name="apartmentId"
                                value={formData.apartmentId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="VD: 101"
                            />
                        </div>

                        {/* Chỉ hiện Trạng thái khi Edit */}
                        {isEditMode && (
                            <div className='md:col-span-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Đã khóa</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã QR</label>
                            <input
                                name="qrCode"
                                value={formData.qrCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">FaceID Data</label>
                            <input
                                name="faceIdData"
                                value={formData.faceIdData}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Xóa cư dân
                        </button>
                    ) : (
                        <div></div> // Spacer div để giữ nút bên phải
                    )}

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
                            disabled={isLoadingAction}
                            className="px-6 py-2 bg-[#333570] text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
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