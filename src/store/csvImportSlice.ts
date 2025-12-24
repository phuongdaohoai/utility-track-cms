// store/slices/csvImportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CSVRow, ValidationError, CSVImportState, ImportRequest } from '../types';
import { csvImportService } from '../services/csvImportService';

const initialState: CSVImportState = {
  data: [],
  errors: [],
  isLoading: false,
  isModalOpen: false,
  importType: 'staff',
  uploadStatus: 'idle',
  uploadMessage: ''
};

// store/slices/csvImportSlice.ts

export const parseCSVFile = createAsyncThunk(
  'csvImport/parseCSV',
  // Nhận payload là object { file, type }
  async ({ file, type }: { file: File; type: 'residents' | 'staff' }, { rejectWithValue }) => {
    try {
      // Truyền type vào hàm parseCSV
      return await csvImportService.parseCSV(file, type);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi parse CSV');
    }
  }
);

// Async thunk để import dữ liệu
export const importCSVData = createAsyncThunk(
  'csvImport/importData',
  async (request: ImportRequest, { rejectWithValue }) => {
    try {
      return await csvImportService.importData(request);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi import');
    }
  }
);

const csvImportSlice = createSlice({
  name: 'csvImport',
  initialState,
  reducers: {
    // Mở/đóng modal
    openModal: (state, action: PayloadAction<'residents' | 'staff'>) => {
      state.isModalOpen = true;
      state.importType = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.data = [];
      state.errors = [];
      state.uploadStatus = 'idle';
    },
    
    // Xử lý dữ liệu thủ công
    setCSVData: (state, action: PayloadAction<CSVRow[]>) => {
      state.data = action.payload;
    },
    
    setValidationErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.errors = action.payload;
    },
    
    // Chỉnh sửa dữ liệu trong preview
    updateRow: (
      state, 
      action: PayloadAction<{ rowIndex: number; field: string; value: string }>
    ) => {
      const { rowIndex, field, value } = action.payload;
      if (state.data[rowIndex]) {
        state.data[rowIndex][field] = value;
      }
    },
    
    // Xóa một dòng
    removeRow: (state, action: PayloadAction<number>) => {
      const rowIndex = action.payload;
      state.data = state.data.filter((_, index) => index !== rowIndex);
      
      // Xóa lỗi liên quan đến dòng này
      state.errors = state.errors.filter(error => error.rowIndex !== rowIndex);
    },
    
    // Reset state
    resetImport: (state) => {
      state.data = [];
      state.errors = [];
      state.uploadStatus = 'idle';
      state.uploadMessage = '';
    }
  },
  extraReducers: (builder) => {
    // Parse CSV
    builder
      .addCase(parseCSVFile.pending, (state) => {
        state.isLoading = true;
        state.errors = [];
      })
      .addCase(parseCSVFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.errors = action.payload.errors;
      })
      .addCase(parseCSVFile.rejected, (state, action) => {
        state.isLoading = false;
        state.errors = [{
          rowIndex: 0,
          message: action.payload as string || 'Lỗi parse file'
        }];
      });
    
    // Import data
    builder
      .addCase(importCSVData.pending, (state) => {
        state.uploadStatus = 'uploading';
        state.uploadMessage = 'Đang import dữ liệu...';
      })
      .addCase(importCSVData.fulfilled, (state, action) => {
        state.uploadStatus = 'success';
       const responseData = action.payload.data; // Truy cập vào object "data" trong JSON trả về
        const { successCount, errorCount, errors } = responseData;
  state.uploadMessage = `Import hoàn tất: ${successCount} thành công, ${errorCount} thất bại`;

        // 3. Map lỗi từ Backend trả về vào state.errors để hiển thị đỏ lên bảng (nếu có)
        if (errors && errors.length > 0) {
          const backendErrors: ValidationError[] = errors.map((err: any) => ({
             // Backend trả về index theo dòng Excel (bắt đầu từ 2), 
             // Frontend mảng bắt đầu từ 0 nên cần trừ 2 để khớp vị trí
             rowIndex: err.index - 2, 
             
             // Format tin nhắn lỗi hiển thị
             message: formatErrorMessage(err) 
          }));
          state.errors = backendErrors;
        }
      })
      .addCase(importCSVData.rejected, (state, action) => {
        state.uploadStatus = 'error';
        state.uploadMessage = action.payload as string || 'Import thất bại';
      });
  }
});
function formatErrorMessage(err: any): string {
    const detail = err.details ? Object.values(err.details).join(', ') : '';
    switch (err.errorCode) {
        // --- RESIDENT ---
        case 'RESIDENT_IMPORT_DUPLICATE_PHONE': 
            return `SĐT cư dân đã tồn tại (${detail})`;
        case 'RESIDENT_IMPORT_DUPLICATE_EMAIL': 
            return `Email cư dân đã tồn tại (${detail})`;
        case 'RESIDENT_IMPORT_DUPLICATE_CCCD': 
            return `CCCD đã tồn tại (${detail})`;

    
        case 'STAFF_IMPORT_DUPLICATE_PHONE':
        case 'DUPLICATE_PHONE': // Phòng trường hợp backend trả code ngắn
            return `SĐT nhân sự đã tồn tại (${detail})`;
            
        case 'STAFF_IMPORT_DUPLICATE_EMAIL':
        case 'DUPLICATE_EMAIL':
            return `Email nhân sự đã tồn tại (${detail})`;

       
        case 'FORMAT_ERROR': 
            return `Lỗi định dạng: ${detail}`;
            
        case 'RESIDENT_IMPORT_SAVE_ERROR':
        case 'STAFF_IMPORT_SAVE_ERROR': 
        case 'SAVE_ERROR':
          
            if (detail.includes('Email đã tồn tại')) return detail;
            return `Lỗi hệ thống khi lưu: ${detail}`;
            
        default: 
            return `${err.errorCode || 'Lỗi'}: ${detail}`;
    }
}
export const {
  openModal,
  closeModal,
  setCSVData,
  setValidationErrors,
  updateRow,
  removeRow,
  resetImport
} = csvImportSlice.actions;

export default csvImportSlice.reducer;