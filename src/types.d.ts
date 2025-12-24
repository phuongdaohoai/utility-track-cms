export interface User {
  id: number
  fullName: string
  roleId?: string
  email: string,
  role?: {
    roleName?: string;
   
  };
  apartment: {
    building: string;
    floorNumber: number;
    roomNumber: string;
  };
  position?: string
  phone?: string
  status?: int
  avatar?: string
}

// types/csvImport.ts
export interface ImportResultData {
  successCount: number;
  errorCount: number;
  successes: any[];
  errors: {
    index: number;
    errorCode: string;
    details: any;
  }[];
}
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
  data: ImportResultData;
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

