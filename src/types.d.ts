export interface User {
  id: number
  fullName: string
  roleId?: string
  role?: {
    roleName?: string;
   
  };
  room?: number
  position?: string
  phone?: string
  status?: int
}

// types/csvImport.ts
export interface CSVRow {
  [key: string]: string;
}

export interface ValidationError {
  rowIndex: number;
  field?: string;
  message: string;
  staffName?: string;
}

export interface CSVImportState {
  data: CSVRow[];
  errors: ValidationError[];
  isLoading: boolean;
  isModalOpen: boolean;
  importType: 'residents' | 'staff';
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadMessage: string;
}

export interface ImportRequest {
  type: 'residents' | 'staff';
  data: CSVRow[];
}

export interface ImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  failedRows?: Array<{
    rowIndex: number;
    errors: string[];
  }>;
}

export type FilterType =
  | "string"
  | "number"
  | "select"
  | "date"
  | "tag";      // 👈 THÊM


export type FilterItem = {
  field: string;
  label: string;
  type: FilterType;
  operator: string;
  value: any;
};

