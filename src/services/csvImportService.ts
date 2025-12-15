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

  validateRow(row: CSVRow, rowIndex: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate staff
    if (row.staffCode && !row.staffName) {
      errors.push({
        rowIndex,
        message: `${row.staffName || `Dòng ${rowIndex + 1}`} - Vị trí không hợp lệ`,
        staffName: row.staffName
      });
    }

    if (row.staffCode && !row.position?.trim()) {
      errors.push({
        rowIndex,
        field: 'position',
        message: `${row.staffName || `Dòng ${rowIndex + 1}`} - Vị trí không hợp lệ`,
        staffName: row.staffName
      });
    }

    if (row.email && !this.isValidEmail(row.email)) {
      errors.push({
        rowIndex,
        field: 'email',
        message: `Email không hợp lệ: ${row.email}`
      });
    }

    return errors;
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};