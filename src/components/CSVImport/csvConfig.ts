// src/components/CSVImport/csvConfig.ts

export interface CsvColumnConfig {
  key: string;
  label: string;
  required: boolean;
  aliases: string[]; 
  labelKey?: string;
}

export const CSV_CONFIG: Record<'staff' | 'residents', CsvColumnConfig[]> = {
  staff: [
    { key: 'fullName', label: 'Tên nhân sự', labelKey: 'csv.staff.fullName', required: true, aliases: ['tennhansu', 'staffname', 'fullname', 'hovaten', 'name'] },
    { key: 'email', label: 'Email', labelKey: 'csv.staff.email', required: true, aliases: ['email', 'thu'] },
    { key: 'phone', label: 'Số điện thoại', labelKey: 'csv.staff.phone', required: true, aliases: ['sodienthoai', 'phone', 'sdt', 'tel'] },
    { key: 'roleId', label: 'Quyền', labelKey: 'csv.staff.roleId', required: true, aliases: ['quyen', 'role', 'vaitro', "roleId"] }, 
    { key: 'password', label: 'Mật khẩu', labelKey: 'csv.staff.password', required: false, aliases: ['matkhau', 'password', 'pass'] }, 
    // { key: 'position', label: 'Vị trí', required: false, aliases: ['vitri', 'position', 'chucvu'] },
    // { key: 'department', label: 'Phòng ban', required: false, aliases: ['phongban', 'department', 'phong'] },
  ],
  residents: [
    { key: 'fullName', label: 'Tên cư dân', labelKey: 'csv.residents.fullName', required: true, aliases: ['tencudan', 'residentname', 'fullname', 'hovaten', 'name'] },
    { key: 'phone', label: 'Số điện thoại', labelKey: 'csv.residents.phone', required: true, aliases: ['sodienthoai', 'phone', 'sdt', 'tel'] },
    { key: 'email', label: 'Email', labelKey: 'csv.residents.email', required: false, aliases: ['email'] },
    { key: 'citizenCard', label: 'CCCD/CMND', labelKey: 'csv.residents.citizenCard', required: true, aliases: ['cccd', 'cmnd', 'citizencard', 'socancuoc'] },
    { key: 'gender', label: 'Giới tính', labelKey: 'csv.residents.gender', required: false, aliases: ['gioitinh', 'gender', 'sex'] },
    { key: 'birthday', label: 'Ngày sinh', labelKey: 'csv.residents.birthday', required: false, aliases: ['ngaysinh', 'birthday', 'dob'] },
    { key: 'apartmentId', label: 'Mã Căn Hộ (ID)', labelKey: 'csv.residents.apartmentId', required: true, aliases: ['apartmentid', 'idcanho'] }, 
    // Nếu nhập số phòng thay vì ID, Backend cần tự map
   
  ],
};