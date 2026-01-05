import { FC, useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Upload, User, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import residentsService from '../../services/residentsService';
import {
  createResident,
  updateResident,
  deleteResident,
  fetchResidentById,
  resetResidentStatus,
} from '../../store/residentsSlice';
import { API_BASE_URL } from '../../utils/url';
import { QRCodeSVG } from 'qrcode.react';
// 1. Interface
interface Apartment {
  id: number;
  building: string;
  roomNumber: string;
  floorNumber: number | null;
}

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentId: number | null;
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

  const {
    currentResident,
    loading,
    createStatus,
    updateStatus,
    error: reduxError
  } = useAppSelector((state) => state.residents);
  const [isResettingQr, setIsResettingQr] = useState(false);
  const isEditMode = !!residentId;
  const currentStatus = isEditMode ? updateStatus : createStatus;
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const isSubmitting = currentStatus === 'loading';
  const isSuccess = currentStatus === 'success';
  const isFailed = currentStatus === 'failed';

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 2. State cho Căn hộ
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showApartmentDropdown, setShowApartmentDropdown] = useState(false);
  // Đã bỏ state apartmentSearch

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
    avatar: "",
    version: 0,
  });

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 8) return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 10)}`;
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(resetResidentStatus());
      setFormErrors({});

      setAvatarPreview(null);
      setShowApartmentDropdown(false);

      // Gọi API lấy danh sách
      const fetchApartments = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/apartment/getAll`);
          const data = await response.json();
          if (data.success) {
            setApartments(data.data);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách căn hộ:", error);
        }
      };
      fetchApartments();

      if (isEditMode && residentId) {
        dispatch(fetchResidentById(residentId));
      } else {
        setFormData({
          fullName: '', phone: '', email: '', citizenCard: '', gender: 'Nam',
          birthday: '', apartmentId: 0, qrCode: '', faceIdData: '', status: 1,
          avatar: "", version: 0
        });
      }
    }
  }, [isOpen, residentId, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && currentResident && isOpen) {
      setFormData({
        fullName: currentResident.fullName || '',
        phone: formatPhoneNumber(currentResident.phone || ''),
        email: currentResident.email || '',
        citizenCard: currentResident.citizenCard || '',
        gender: currentResident.gender || 'Nam',
        birthday: currentResident.birthday ? String(currentResident.birthday).split('T')[0] : '',
        apartmentId: currentResident.apartment?.id || 0,
        qrCode: currentResident.qrCode || '',
        faceIdData: currentResident.faceIdData || '',
        status: currentResident.status ?? 1,
        version: currentResident.version ?? 0,
        avatar: currentResident.avatar || "",
      });

      if (currentResident.avatar) {
        const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
        const cleanAvatarPath = currentResident.avatar.startsWith('/') ? currentResident.avatar : `/${currentResident.avatar}`;
        const url = currentResident.avatar.startsWith('http')
          ? currentResident.avatar
          : `${cleanBaseUrl}${cleanAvatarPath}`;
        setAvatarPreview(url);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [currentResident, isEditMode, isOpen]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetResidentStatus());
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch, onClose, onSuccess]);

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
  const handleResetQrCode = async () => {
    if (!residentId) return;

    // Xác nhận trước khi reset (tuỳ chọn)
    if (!window.confirm("Bạn có chắc chắn muốn làm mới mã QR của cư dân này? Mã cũ sẽ không còn hiệu lực.")) {
      return;
    }

    setIsResettingQr(true);
    try {
      const res = await residentsService.resetQrCode(residentId);
      const newQrCode = res.data?.qrCode || res.data;

      if (newQrCode) {
        setFormData(prev => ({ ...prev, qrCode: newQrCode }));
        alert("Đã làm mới mã QR thành công!");
      } else {
        dispatch(fetchResidentById(residentId));
        alert("Đã reset. Đang tải lại dữ liệu...");
      }

    } catch (error) {
      console.error("Lỗi reset QR:", error);
      alert("Không thể làm mới mã QR. Vui lòng thử lại.");
    } finally {
      setIsResettingQr(false);
    }
  };
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File tối đa 5MB');
      return;
    }

    setIsUploadingAvatar(true); // Bật trạng thái loading

    try {
      // 1. Gọi service upload ngay lập tức
      const res = await residentsService.uploadAvatar(file);

      // Giả sử res.data chứa path của ảnh (vd: "uploads/avatar/img.jpg")
      const uploadedPath = res.data;
      console.log(uploadedPath)
      // 2. Cập nhật URL vào formData
      setFormData(prev => ({ ...prev, avatar: uploadedPath }));

      // 3. Hiển thị Preview
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const cleanAvatarPath = uploadedPath.startsWith('/') ? uploadedPath : `/${uploadedPath}`;
      setAvatarPreview(`${cleanBaseUrl}${cleanAvatarPath}`);

    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false); // Tắt trạng thái loading
      // Reset input để có thể chọn lại cùng 1 file nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!residentId) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa cư dân này?")) {
      try {
        await dispatch(deleteResident(residentId)).unwrap();
        dispatch(resetResidentStatus());
        if (onSuccess) onSuccess();
        onClose();
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

    if (!formData.email.trim()) errors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ';

    if (!formData.citizenCard.trim()) {
      errors.citizenCard = 'CCCD là bắt buộc';
    } else if (!/^\d+$/.test(formData.citizenCard)) {
      errors.citizenCard = 'CCCD chỉ được chứa chữ số';
    } else if (formData.citizenCard.length !== 12) {
      errors.citizenCard = 'CCCD phải đúng 12 số';
    }

    if (!formData.birthday) {
      errors.birthday = 'Ngày sinh là bắt buộc';
    } else {
      const birthday = new Date(formData.birthday);
      const today = new Date();
      birthday.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (birthday > today) {
        errors.birthday = 'Ngày sinh không được lớn hơn ngày hiện tại';
      }
    }

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
      citizenCard: formData.citizenCard,
      gender: formData.gender,
      birthday: formData.birthday,
      apartmentId: Number(formData.apartmentId),
      status: Number(formData.status),
      qrCode: formData.qrCode,
      faceIdData: formData.faceIdData,
      avatar: formData.avatar,
    };

    console.log(payload)
    if (isEditMode && residentId) {
      dispatch(updateResident({
        id: residentId,
        residentData: {
          ...payload,
          version: Number(formData.version),
        },

      }));
    } else {
      dispatch(createResident(payload));
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

        {isEditMode && loading && !currentResident ? (
          <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 flex-1">

            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 border border-green-200 animate-fade-in">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!'}
                </span>
              </div>
            )}
            {isFailed && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  {reduxError || "Có lỗi xảy ra, vui lòng thử lại."}
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* LEFT COLUMN: AVATAR */}
              <div className="w-full md:w-1/4 flex flex-col items-center gap-4">
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
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">{formData.fullName || "Tên Cư Dân"}</h3>
                </div>
              </div>

              {/* RIGHT COLUMN: FORM FIELDS */}
              <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
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
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
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

                {/* --- CUSTOM DROPDOWN CĂN HỘ (KHÔNG SEARCH) --- */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ</label>

                  {/* Ô hiển thị giá trị */}
                  <div
                    onClick={() => setShowApartmentDropdown(!showApartmentDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer flex justify-between items-center"
                  >
                    <span className={formData.apartmentId ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.apartmentId
                        ? apartments.find(a => a.id === Number(formData.apartmentId))?.roomNumber
                          ? `${apartments.find(a => a.id === Number(formData.apartmentId))?.building} - ${apartments.find(a => a.id === Number(formData.apartmentId))?.roomNumber}`
                          : "Đã chọn (ID: " + formData.apartmentId + ")"
                        : "-- Chọn căn hộ --"}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>

                  {/* Dropdown List - CHỈ CÓ LIST, KHÔNG CÓ SEARCH */}
                  {showApartmentDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl">
                      {/* max-h-60 giúp danh sách thấp (khoảng 240px) và có thanh cuộn */}
                      <ul className="max-h-60 overflow-y-auto">
                        {apartments.length > 0 ? (
                          apartments.map((apt) => (
                            <li
                              key={apt.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, apartmentId: apt.id }));
                                setShowApartmentDropdown(false);
                              }}
                              className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${formData.apartmentId === apt.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700'
                                }`}
                            >
                              {apt.building} - {apt.roomNumber} {apt.floorNumber ? `(Tầng ${apt.floorNumber})` : ''}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-sm text-gray-500 text-center">Đang tải danh sách...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Click ra ngoài để đóng */}
                  {showApartmentDropdown && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowApartmentDropdown(false)}></div>
                  )}
                </div>

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
                      <option value={0}>khóa</option>
                    </select>
                  </div>
                )}

              {isEditMode && (
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã QR Truy cập</label>
                    <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                        {formData.qrCode ? (
                          <QRCodeSVG 
                            value={formData.qrCode}
                            size={100}
                            level="M"
                          />
                        ) : (
                          <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center text-xs text-gray-500 text-center">
                            Chưa có mã
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Chuỗi mã:</p>
                          <code className="block bg-gray-200 px-2 py-1 rounded text-sm text-gray-700 break-all font-mono">
                            {formData.qrCode || "N/A"}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetQrCode}
                          disabled={isResettingQr}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isResettingQr ? 'animate-spin' : ''}`} />
                          {isResettingQr ? 'Đang tạo mới...' : 'Làm mới QR Code'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                <div></div>
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
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#333570] text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
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