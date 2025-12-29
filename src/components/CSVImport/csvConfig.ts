// src/components/CSVImport/csvConfig.ts

export interface CsvColumnConfig {
  key: string;
  label: string;
  required: boolean;
  aliases: string[]; 
}

export const CSV_CONFIG: Record<'staff' | 'residents', CsvColumnConfig[]> = {
  staff: [
    { key: 'fullName', label: 'Tên nhân sự', required: true, aliases: ['tennhansu', 'staffname', 'fullname', 'hovaten', 'name'] },
    { key: 'email', label: 'Email', required: true, aliases: ['email', 'thu'] },
    { key: 'phone', label: 'Số điện thoại', required: true, aliases: ['sodienthoai', 'phone', 'sdt', 'tel'] },
    { key: 'roleId', label: 'Quyền', required: true, aliases: ['quyen', 'role', 'vaitro', "roleId"] }, 
    { key: 'password', label: 'Mật khẩu', required: false, aliases: ['matkhau', 'password', 'pass'] }, 
    // { key: 'position', label: 'Vị trí', required: false, aliases: ['vitri', 'position', 'chucvu'] },
    // { key: 'department', label: 'Phòng ban', required: false, aliases: ['phongban', 'department', 'phong'] },
  ],
  residents: [
    { key: 'fullName', label: 'Tên cư dân', required: true, aliases: ['tencudan', 'residentname', 'fullname', 'hovaten', 'name'] },
    { key: 'phone', label: 'Số điện thoại', required: true, aliases: ['sodienthoai', 'phone', 'sdt', 'tel'] },
    { key: 'email', label: 'Email', required: false, aliases: ['email'] },
    { key: 'citizenCard', label: 'CCCD/CMND', required: true, aliases: ['cccd', 'cmnd', 'citizencard', 'socancuoc'] },
    { key: 'gender', label: 'Giới tính', required: false, aliases: ['gioitinh', 'gender', 'sex'] },
    { key: 'birthday', label: 'Ngày sinh', required: false, aliases: ['ngaysinh', 'birthday', 'dob'] },
    { key: 'apartmentId', label: 'Mã Căn Hộ (ID)', required: true, aliases: ['apartmentid', 'idcanho'] }, 
    // Nếu nhập số phòng thay vì ID, Backend cần tự map
   
  ],
};