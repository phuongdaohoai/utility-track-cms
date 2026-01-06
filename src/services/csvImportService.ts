import { CSVRow, ValidationError, ImportRequest, ImportResponse } from '../types';
import { CSV_CONFIG } from '../components/CSVImport/csvConfig';

import { api } from '../utils/api';
export const csvImportService = {
  async parseCSV(file: File, type: 'residents' | 'staff'): Promise<{ data: CSVRow[]; errors: ValidationError[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const { data, errors } = this.parseCSVText(text, type);
          resolve({ data, errors });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Lỗi đọc file'));
      reader.readAsText(file, 'UTF-8');
    });
  },

  parseCSVText(text: string, type: 'residents' | 'staff'): { data: CSVRow[]; errors: ValidationError[] } {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      return { data: [], errors: [{ rowIndex: -1, message: 'File rỗng' }] };
    }

    const delimiter = this.detectDelimiter(lines[0]);
    const originalHeaders = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

    const config = CSV_CONFIG[type];
    const headerMapping: Record<number, string> = {};

    originalHeaders.forEach((header, index) => {
      const cleanHeader = this.simplifyString(header);
      const matchedCol = config.find(col =>
        this.simplifyString(col.key) === cleanHeader ||
        col.aliases.some(alias => this.simplifyString(alias) === cleanHeader)
      );

      if (matchedCol) {
        headerMapping[index] = matchedCol.key;
      }
    });

    const mappedKeys = Object.values(headerMapping);
    const missingColumns = config.filter(col => col.required && !mappedKeys.includes(col.key));

    if (missingColumns.length > 0) {
      const missingLabels = missingColumns.map(c => c.label).join(', ');
      const allRequiredLabels = config.map(c => c.label).join(', ');

      return {
        data: [],
        errors: [{
          rowIndex: -1,
          message: `Thiếu cột bắt buộc: ${missingLabels}\n(Các cột bắt buộc: ${allRequiredLabels})`
        }]
      };
    }

    const data: CSVRow[] = [];
    const errors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter);

      if (values.length < Object.keys(headerMapping).length * 0.5) continue;

      const row: CSVRow = {};

      Object.keys(headerMapping).forEach((colIndex) => {
        const index = Number(colIndex);
        const key = headerMapping[index];
        row[key] = values[index] || '';
      });

      const rowErrors = this.validateRow(row, i - 1, type);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      }

      data.push(row);
    }

    return { data, errors };
  },

  async importData(request: ImportRequest): Promise<ImportResponse> {
    const endpoint = request.type === 'staff' ? 'staff' : 'residents';
    const payloadKey = request.type === 'staff' ? 'staffs' : 'residents'; 

    const payload = { [payloadKey]: request.data };
 
    const response = await api.post(`/${endpoint}/import`, payload);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Import thất bại: ${response.statusText}`);
    }
    return response.json();
  },
  simplifyString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').toLowerCase();
  },

  validateRow(row: CSVRow, rowIndex: number, type: 'residents' | 'staff'): ValidationError[] {
    const errors: ValidationError[] = [];
    const config = CSV_CONFIG[type];

    let displayName = `Dòng ${rowIndex + 1}`;
    if (row.fullName) displayName = row.fullName;
    else if (row.staffName) displayName = row.staffName;

    config.filter(c => c.required).forEach(col => {
      if (!row[col.key] || row[col.key].trim() === '') {
        errors.push({
          rowIndex,
          field: col.key,
          message: `${displayName} - Thiếu thông tin: ${col.label}`
        });
      }
    });

    if (row.email && !this.isValidEmail(row.email)) {
      errors.push({ rowIndex, field: 'email', message: `${displayName} - Email không hợp lệ` });
    }

    if (row.phone && !this.isValidPhone(row.phone)) {
      errors.push({ rowIndex, field: 'phone', message: `${displayName} - SĐT không hợp lệ` });
    }

    if (type === 'residents' && row.citizenCard) {
      if (!/^\d{12}$/.test(row.citizenCard.trim())) {
        errors.push({ rowIndex, field: 'citizenCard', message: `${displayName} - CCCD phải có 12 chữ số` });
      }
    }

    return errors;
  },

  detectDelimiter(line: string): string {
    const comma = (line.match(/,/g) || []).length;
    const semicolon = (line.match(/;/g) || []).length;
    return semicolon > comma ? ';' : ',';
  },

  parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim()); current = '';
      } else { current += char; }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, ''));
  },

  isValidPhone(phone: string): boolean {
    return /^(0|\+84)(\d{9,10})$/.test(phone.replace(/[\s\.]/g, ''));
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};