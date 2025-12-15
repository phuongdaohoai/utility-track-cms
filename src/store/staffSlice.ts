// store/staffSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import staffService, { Staff, UpdateStaffPayload } from '../services/staffService';

interface StaffState {
  currentStaff: Staff | null;
  loading: boolean;
  error: string | null;
  updateStatus: 'idle' | 'loading' | 'success' | 'failed';
}

const initialState: StaffState = {
  currentStaff: null,
  loading: false,
  error: null,
  updateStatus: 'idle',
};

// Thunk lấy thông tin chi tiết
export const fetchStaffById = createAsyncThunk(
  'staff/fetchById',
  async (id: string | number, thunkAPI) => {
    try {
      const response = await staffService.getById(id);
      return response.data; // Trả về object staff nằm trong field data
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Thunk cập nhật thông tin
export const updateStaff = createAsyncThunk(
  'staff/update',
  async (data: UpdateStaffPayload, thunkAPI) => {
    try {
      const response = await staffService.update(data);
      return response.data; // Trả về data mới sau khi update
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/delete',
  async (id: number, thunkAPI) => {
    try {
      const response = await staffService.delete(id);
      return id; // Trả về ID đã xóa để reducer biết mà lọc bỏ khỏi danh sách (nếu có lưu list)
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Xử lý fetchStaffById
    builder
      .addCase(fetchStaffById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentStaff = null;
      })
      .addCase(fetchStaffById.fulfilled, (state, action: PayloadAction<Staff>) => {
        state.loading = false;
        state.currentStaff = action.payload;
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Xử lý updateStaff
    builder
      .addCase(updateStaff.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.updateStatus = 'success';
        // Có thể cập nhật lại currentStaff bằng dữ liệu mới trả về
        if (state.currentStaff) {
             state.currentStaff = { ...state.currentStaff, ...action.payload };
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetUpdateStatus } = staffSlice.actions;
export default staffSlice.reducer;