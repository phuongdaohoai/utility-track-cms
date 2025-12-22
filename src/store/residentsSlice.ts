// store/residentsSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import residentsService, {Resident} from '../services/residentsService';

interface ResidentsState {
  currentResident: Resident | null;
  loading: boolean;
  updateStatus: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}
const initialState: ResidentsState = {
  currentResident: null,
  loading: false,
  updateStatus: 'idle',
  error: null,
};
export const fetchResidentById = createAsyncThunk(
  'residents/fetchById',
  async (id: number, thunkAPI) => {
    try {
      const res = await residentsService.getById(id);
      return res.data; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateResident = createAsyncThunk(
  'residents/update',
  async ({ id, data }: { id: number, data: FormData }, thunkAPI) => {
    try {
      const res = await residentsService.update(id, data);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteResident = createAsyncThunk(
  'residents/delete',
  async (id: number, thunkAPI) => {
    try {
      await residentsService.delete(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const residentsSlice = createSlice({
  name: 'residents',
  initialState,
  reducers: {
    resetResidentStatus: (state) => {
      state.updateStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchResidentById.pending, (state) => {
        state.loading = true;
        state.currentResident = null;
      })
      .addCase(fetchResidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResident = action.payload;
      })
      .addCase(fetchResidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateResident.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateResident.fulfilled, (state) => {
        state.updateStatus = 'success';
      })
      .addCase(updateResident.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});
export const { resetResidentStatus } = residentsSlice.actions;
export default residentsSlice.reducer;