// store/staffSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import staffService, { Staff} from '../services/staffService';

interface StaffState {
  currentStaff: Staff | null;
  loading: boolean;
  error: string | null;
  updateStatus: 'idle' | 'loading' | 'success' | 'failed';
  createStatus: 'idle' | 'loading' | 'success' | 'failed'; 
  createMessage: string | null;
}

const initialState: StaffState = {
  currentStaff: null,
  loading: false,
  error: null,
  updateStatus: 'idle',
  createStatus: 'idle', 
  createMessage: null,
};
export const createStaff = createAsyncThunk(
  'staff/create',
  async (
    { staffData, avatarFile }: { staffData: any; avatarFile: File | null },
    thunkAPI
  ) => {
    try {
      let avatarUrl = '';

      if (avatarFile) {
        const uploadRes = await staffService.uploadAvatar(avatarFile);
        avatarUrl = uploadRes.data || '';
      }

      const payload = {
        ...staffData,
        avatar: avatarUrl || undefined,
      };

      const res = await staffService.create(payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
export const updateStaff = createAsyncThunk(
  'staff/update',
  async (
    { staffData, avatarFile }: { staffData: any; avatarFile: File | null },
    thunkAPI
  ) => {
    try {
      let avatarUrl = staffData.avatar || '';

      if (avatarFile) {
        const uploadRes = await staffService.uploadAvatar(avatarFile);
        avatarUrl = uploadRes.data || '';
      }

      const payload = {
        ...staffData,
        avatar: avatarUrl || undefined,
      };

      const res = await staffService.update(payload);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

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
    },
    resetCreateStatus: (state) => { 
      state.createStatus = 'idle';
      state.createMessage = null;
    }
  },
  extraReducers: (builder) => {
   
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

   
    builder
      .addCase(updateStaff.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.updateStatus = 'success';
        
        if (state.currentStaff) {
             state.currentStaff = { ...state.currentStaff, ...action.payload };
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload as string;
      });

      builder
      .addCase(createStaff.pending, (state) => {
        state.createStatus = 'loading';
        state.createMessage = null;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.createStatus = 'success';
        state.createMessage = 'Tạo nhân viên thành công!';
        state.currentStaff = action.payload;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createMessage = action.payload as string;
        state.error = action.payload as string;
      });
  },
});

export const { resetUpdateStatus,  resetCreateStatus } = staffSlice.actions;
export default staffSlice.reducer;