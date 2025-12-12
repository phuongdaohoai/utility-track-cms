import React, { useState, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from '../../store/hooks'
type UserStatus = "active" | "inactive" | "suspended";

const initialAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop";

export default function ProfileEdit(): JSX.Element {
     const { name, role } = useAppSelector((state) => state.auth.user || { name: 'User', role: 'Guest' });
  const [avatar, setAvatar] = useState<string>(initialAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [fullName, setFullName] = useState<string>("Admin A");
  const [department, setDepartment] = useState<string>("1");
  const [phone, setPhone] = useState<string>("0943 944 245");
  const [status, setStatus] = useState<UserStatus>("active");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateAvatar = () => {
    // giả lập upload
    if (!avatarFile) {
      alert("Chọn ảnh trước khi ấn Update");
      return;
    }
    // ở đây bạn sẽ gửi avatarFile lên server
    alert("Ảnh được cập nhật (giả lập)");
  };

  const handleDelete = () => {
    // giả lập xóa user
    const ok = confirm("Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.");
    if (ok) {
      alert("Đã xóa (giả lập)");
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    // validate mẫu
    if (!fullName.trim()) {
      alert("Họ và tên không được để trống");
      return;
    }
    // gửi dữ liệu lên API
    const payload = { fullName, department, phone, status };
    console.log("save payload", payload);
    alert("Lưu thông tin thành công (giả lập)");
  };

  return (
    <div className="">
         <header className="bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900"></h2>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">B</div>
            <div className="text-sm text-gray-600">
              {name}<br />
              <span className="text-xs text-gray-400">{role}</span>
            </div>
          </div>
        </div>
      </header>
      <div className="  bg-white rounded-lg shadow-sm border border-gray-200  m-2 ">
        <form onSubmit={handleSave} className="p-6">
          <div className="flex gap-6">
            {/* Left: Avatar */}
           <div className="w-1/3 flex flex-col items-center gap-6">
  {/* Avatar Display */}
  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
    <img 
      src={avatar} 
      alt="avatar" 
      className="w-full h-full object-cover" 
    />
  </div>

  {/* Input File (Ẩn đi) */}
  <input
    id="avatar-upload" // Thêm ID để link với label
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="hidden"
  />

  {/* Button Update (Dùng thẻ label để trigger input file) */}
  <label
    htmlFor="avatar-upload"
    className="cursor-pointer flex items-center gap-2 px-6 py-2 border border-indigo-900 text-indigo-900 bg-white rounded hover:bg-indigo-50 transition-colors font-medium shadow-sm"
  >
    {/* Icon Upload (Mũi tên hướng lên) */}
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

            {/* Right: Fields */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-center">
                <label className="text-sm text-gray-600">Họ Và Tên</label>
                <input
                  className="col-span-1 bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <label className="text-sm text-gray-600">Phòng</label>
                <input
                  className="col-span-1 bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />

                <label className="text-sm text-gray-600">Số Điện Thoại</label>
                <input
                  className="col-span-1 bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <label className="text-sm text-gray-600">Trạng Thái</label>
                <select
                  className="col-span-1 bg-gray-100 rounded-md px-3 py-2 text-sm w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                >
                  <option value="active">Hoạt Động</option>
                  <option value="inactive">Không Hoạt Động</option>
                  <option value="suspended">Bị Khoá</option>
                </select>
              </div>

              <div className="border-t mt-6 pt-4 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Xóa
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
