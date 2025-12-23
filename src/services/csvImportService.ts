// services/csvImportService.ts
import { CSVRow, ValidationError, ImportRequest, ImportResponse } from '../types';

export const csvImportService = {
  // Parse CSV file
  async parseCSV(file: File): Promise<{ data: CSVRow[]; errors: ValidationError[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          let { data, errors } = this.parseCSVText(text);

          // Làm giàu dữ liệu: chuyển apartmentId → Số phòng + Tòa nhà
          data = await this.enrichDataWithApartmentDetails(data);
          

          resolve({ data, errors });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Lỗi đọc file'));
      reader.readAsText(file, 'UTF-8');
    });
  },

  // Parse CSV text
  parseCSVText(text: string): { data: CSVRow[]; errors: ValidationError[] } {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      return { data: [], errors: [] };
    }

    const delimiter = this.detectDelimiter(lines[0]);
    const headers = lines[0].split(delimiter).map(h => h.trim());

    const data: CSVRow[] = [];
    const errors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter);
      const row: CSVRow = {};

      headers.forEach((header, idx) => {
        const key = this.normalizeHeader(header);
        row[key] = values[idx] || '';
      });

      // Validate row
      const rowErrors = this.validateRow(row, i - 1);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      }

      data.push(row);
    }

    return { data, errors };
  },

  // Import data to API
  async importData(request: ImportRequest): Promise<ImportResponse> {
    // Gọi API thực tế
    const response = await fetch(`/api/${request.type}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: request.data }),
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Fetch thông tin căn hộ từ backend
  async fetchApartmentDetails(ids: string[]): Promise<Record<string, { building: string; roomNumber: string }>> {
    if (ids.length === 0) return {};

    try {
      const response = await fetch(
        `http://localhost:3000/apartment/by-ids?ids=${ids.join(',')}`
      );
      if (!response.ok) {
        console.warn('Không thể lấy thông tin căn hộ:', response.status);
        return {};
      }
      const apartments: any[] = await response.json();

      const map: Record<string, { building: string; roomNumber: string }> = {};
      apartments.forEach(apt => {
        map[apt.id.toString()] = {
          building: apt.building || 'Không xác định',
          roomNumber: apt.roomNumber || apt.id.toString(),
        };
      });
      return map;
    } catch (error) {
      console.error('Lỗi fetch apartments:', error);
      return {};
    }
  },

  // Làm giàu dữ liệu: apartmentId → roomNumber + building
  async enrichDataWithApartmentDetails(data: CSVRow[]): Promise<CSVRow[]> {
    const apartmentIds = [...new Set(
      data
        .map(row => row.apartmentId?.toString())
        .filter(Boolean)
    )];

    const apartmentMap = await this.fetchApartmentDetails(apartmentIds);

    data.forEach(row => {
      const id = row.apartmentId?.toString();

      if (id && apartmentMap[id]) {
        row.roomNumber = apartmentMap[id].roomNumber;
        row.building = apartmentMap[id].building;
      } else if (id) {
        row.roomNumber = id;
        row.building = 'Không xác định';
      }

      // XÓA SẠCH key room để tránh cột rác
      delete row.room;
      // Giữ apartmentId để import, nhưng không hiển thị
    });

    return data;
  },

  getRoleName(roleId: string | number): string {
    const roleMap: Record<string, string> = {
      '1': 'SuperAdmin',
      '2': 'Admin',
      '3': 'Manager',
      '4': 'Staff',
      // Nếu sau này có thêm role mới thì chỉ cần thêm 1 dòng ở đây
    };
    return roleMap[roleId.toString()] || `Role ${roleId}`;
  },

  enrichDataWithRoleNames(data: CSVRow[]): CSVRow[] {
    data.forEach(row => {
      if (row.roleId) {
        row.roleName = this.getRoleName(row.roleId);
      }
    });
    return data;
  },
  // Helper methods
  detectDelimiter(line: string): string {
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    const tabCount = (line.match(/\t/g) || []).length;

    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount) return ';';
    return ',';
  },

  parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, ''));
  },

  // Chỉ map các header cần thiết, KHÔNG map apartmentId thành room nữa
  normalizeHeader(header: string): string {
    const headerMap: Record<string, string> = {
      'Mã nhân sự': 'staffCode',
      'Tên nhân sự': 'staffName',
      'Email': 'email',
      'Vị trí': 'position',
      'Phòng ban': 'department',
      'Quyền': 'role',
      'Mật khẩu': 'password',
      'Mã cư dân': 'residentCode',
      'Tên cư dân': 'fullName',
      'Số điện thoại': 'phone',

      'fullName': 'fullName',
      'Tên đầy đủ': 'fullName',
      'phone': 'phone',
      'email': 'email',
      'citizenCard': 'citizenCard',
      'CCCD': 'citizenCard',
      'CMND': 'citizenCard',
      'gender': 'gender',
      'Giới tính': 'gender',
      'birthday': 'birthday',
      'Ngày sinh': 'birthday',

      // Giữ apartmentId làm key riêng để import
      'apartmentId': 'apartmentId',
      'ApartmentId': 'apartmentId',
      'ApartmentID': 'apartmentId',
      'Mã căn hộ': 'apartmentId',

      'building': 'building',
      'Tòa': 'building',
      'residentCode': 'residentCode',
    };
    return headerMap[header.trim()] || header.toLowerCase().replace(/\s+/g, '');
  },

  validateRow(row: CSVRow, rowIndex: number): ValidationError[] {
    const errors: ValidationError[] = [];

    const getDisplayName = (): string => {
      if (row.staffName?.trim()) return row.staffName;
      if (row.fullName?.trim()) return row.fullName;
      if (row.staffCode?.trim()) return `ID: ${row.staffCode}`;
      if (row.residentCode?.trim()) return `ID: ${row.residentCode}`;
      return `Dòng ${rowIndex + 1}`;
    };

    const displayName = getDisplayName();

    // Validate staff (giữ nguyên)
    if (row.staffCode) {
      const requiredStaffFields = [
        { key: 'staffName', label: 'Tên nhân sự' },
        { key: 'position', label: 'Vị trí' },
        { key: 'department', label: 'Phòng ban' },
        { key: 'role', label: 'Quyền' }
      ];
      requiredStaffFields.forEach(({ key, label }) => {
        if (!row[key]?.trim()) {
          errors.push({
            rowIndex,
            field: key,
            message: `${displayName} - ${label} không hợp lệ`,
          });
        }
      });
    }

    // Validate resident – BỎ yêu cầu 'room' vì giờ dùng apartmentId
    if (!row.staffCode) { // giả sử là resident nếu không phải staff
      if (!row.fullName?.trim()) {
        errors.push({
          rowIndex,
          field: 'fullName',
          message: `${displayName} - Tên cư dân không hợp lệ`,
        });
      }
      if (!row.phone?.trim()) {
        errors.push({
          rowIndex,
          field: 'phone',
          message: `${displayName} - Số điện thoại không hợp lệ`,
        });
      }
    }

    if (row.email && !this.isValidEmail(row.email)) {
      errors.push({
        rowIndex,
        field: 'email',
        message: `${displayName} - Email không hợp lệ`
      });
    }

    if (row.phone && !this.isValidPhone(row.phone)) {
      errors.push({
        rowIndex,
        field: 'phone',
        message: `${displayName} - Số điện thoại không hợp lệ`
      });
    }

    return errors;
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
};