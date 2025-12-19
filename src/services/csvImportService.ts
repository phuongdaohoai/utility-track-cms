// services/csvImportService.ts
import { CSVRow, ValidationError, ImportRequest, ImportResponse } from '../types';

export const csvImportService = {
  // Parse CSV file
  async parseCSV(file: File): Promise<{ data: CSVRow[]; errors: ValidationError[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const { data, errors } = this.parseCSVText(text);
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
      'Phòng': 'room',
      'Tòa nhà': 'building',
      'Số điện thoại': 'phone'
    };

    return headerMap[header.trim()] || header.toLowerCase().replace(/\s+/g, '');
  },

  // services/csvImportService.ts (phần validateRow cập nhật)
validateRow(row: CSVRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Helper function để lấy tên hiển thị
  const getDisplayName = (): string => {
    if (row.staffName?.trim()) return row.staffName;
    if (row.fullName?.trim()) return row.fullName;
    if (row.staffCode?.trim()) return `ID: ${row.staffCode}`;
    if (row.residentCode?.trim()) return `ID: ${row.residentCode}`;
    return `Dòng ${rowIndex + 1}`;
  };

  const displayName = getDisplayName();

  // Validate staff fields
  if (row.staffCode) {
    // Các trường bắt buộc cho nhân sự
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
          staffName: displayName
        });
      }
    });
  }

  // Validate resident fields
  if (row.residentCode) {
    // Các trường bắt buộc cho cư dân
    const requiredResidentFields = [
      { key: 'fullName', label: 'Tên cư dân' },
      { key: 'room', label: 'Phòng' },
      { key: 'phone', label: 'Số điện thoại' }
    ];

    requiredResidentFields.forEach(({ key, label }) => {
      if (!row[key]?.trim()) {
        errors.push({
          rowIndex,
          field: key,
          message: `${displayName} - ${label} không hợp lệ`,
          staffName: displayName
        });
      }
    });
  }

  // Validate email format
  if (row.email && !this.isValidEmail(row.email)) {
    errors.push({
      rowIndex,
      field: 'email',
      message: `${displayName} - Email không hợp lệ`
    });
  }

  // Validate phone format (nếu có)
  if (row.phone && !this.isValidPhone(row.phone)) {
    errors.push({
      rowIndex,
      field: 'phone',
      message: `${displayName} - Số điện thoại không hợp lệ`
    });
  }

  return errors;
},

// Thêm hàm validate phone
isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
},

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};