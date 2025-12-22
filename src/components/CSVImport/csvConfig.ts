// src/constants/csvConfig.ts

export interface CsvColumnConfig {
  key: string;
  label: string;
  required: boolean;
}

export const CSV_COLUMNS: Record<'staff' | 'residents', CsvColumnConfig[]> = {
  staff: [
    { key: 'staffCode', label: 'Mã nhân sự', required: false },
    { key: 'staffName', label: 'Tên nhân sự', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'position', label: 'Vị trí', required: true },
    { key: 'department', label: 'Phòng ban', required: true },
    { key: 'role', label: 'Quyền', required: true },
    { key: 'password', label: 'Mật khẩu', required: false }, // Tùy logic của bạn
  ],
  residents: [
    { key: 'residentCode', label: 'Mã cư dân', required: false },
    { key: 'fullName', label: 'Tên cư dân', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'room', label: 'Phòng', required: true },
    { key: 'building', label: 'Tòa nhà', required: false },
    { key: 'phone', label: 'Số điện thoại', required: true },
  ],
};