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

// Async thunk để parse CSV
export const parseCSVFile = createAsyncThunk(
  'csvImport/parseCSV',
  async (file: File, { rejectWithValue }) => {
    try {
      return await csvImportService.parseCSV(file);
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
        state.uploadMessage = action.payload.message;
        
        // Nếu có dòng lỗi trong response, thêm vào errors
        if (action.payload.failedRows) {
          const newErrors: ValidationError[] = action.payload.failedRows.flatMap(failedRow => 
            failedRow.errors.map(error => ({
              rowIndex: failedRow.rowIndex,
              message: error
            }))
          );
          state.errors = [...state.errors, ...newErrors];
        }
      })
      .addCase(importCSVData.rejected, (state, action) => {
        state.uploadStatus = 'error';
        state.uploadMessage = action.payload as string || 'Import thất bại';
      });
  }
});

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