import React, { useState, ChangeEvent } from 'react';

interface CreateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CreateResidentModal: React.FC<CreateResidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    citizenCard: '',
    gender: 'Nam',
    birthday: '',
    apartmentId: '',
    qrCode: '',
    faceIdData: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
 
    setFormData({
      fullName: '', phone: '', email: '', citizenCard: '', gender: 'Nam',
      birthday: '', apartmentId: '', qrCode: '', faceIdData: ''
    });
    setErrors({});
    setAvatarFile(null);
    setPreview('');
    onClose();
  };

  // --- 1. VALIDATE CLIENT SIDE ---
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên là bắt buộc';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'SĐT là bắt buộc';
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'SĐT không hợp lệ (10-11 số)';
    }

    if (!formData.citizenCard.trim()) {
      newErrors.citizenCard = 'CCCD là bắt buộc';
    } else if (formData.citizenCard.length !== 12) {
      newErrors.citizenCard = 'CCCD phải đúng 12 số';
    }

    if (!formData.birthday) newErrors.birthday = 'Ngày sinh là bắt buộc';
    
    // Nếu apartmentId bắt buộc thì uncomment dòng dưới
    // if (!formData.apartmentId) newErrors.apartmentId = 'Mã căn hộ là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- 2. KẾT NỐI API POST /residents/create ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
  
      const submitData = new FormData();
      
    
      Object.entries(formData).forEach(([key, value]) => {
       
        if (value) submitData.append(key, value);
      });

     
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/residents/create`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        
        },
        body: submitData
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tạo cư dân');
      }

    
      alert('Tạo cư dân thành công!');
      onSuccess(); 
      handleClose();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#333570]">Thêm Mới Cư Dân</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2 mb-4">
             <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center relative group">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">Ảnh đại diện</span>
                )}
             </div>
             <label className="cursor-pointer px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200 hover:bg-indigo-100 transition-colors">
                Chọn ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fullname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'}`}
                placeholder="0901234567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="email@example.com"
              />
            </div>

             {/* CCCD */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CCCD (12 số) <span className="text-red-500">*</span></label>
              <input 
                name="citizenCard"
                value={formData.citizenCard}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.citizenCard ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'}`}
                placeholder="001234567890"
              />
              {errors.citizenCard && <p className="text-red-500 text-xs mt-1">{errors.citizenCard}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính <span className="text-red-500">*</span></label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
              <input 
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.birthday ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'}`}
              />
              {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
            </div>

            {/* Apartment ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã căn hộ (ID)</label>
              <input 
                name="apartmentId"
                type="number"
                value={formData.apartmentId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="VD: 101"
              />
            </div>

            {/* QR Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã QR</label>
              <input 
                name="qrCode"
                value={formData.qrCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Mã định danh"
              />
            </div>

             {/* FaceID Data */}
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dữ liệu FaceID</label>
              <input 
                name="faceIdData"
                value={formData.faceIdData}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Chuỗi base64 hoặc đường dẫn..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4 sticky bottom-0 bg-white">
            <button 
              type="button"
              onClick={handleClose} 
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 text-sm font-medium disabled:bg-indigo-300 flex items-center gap-2 transition-colors"
            >
              {isLoading && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Thêm mới
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};