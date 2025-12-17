import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService, { Role } from '../services/roleService';

interface RoleState {
  roles: Role[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: RoleState = {
  roles: [],
  status: 'idle',
};

export const fetchRoles = createAsyncThunk('roles/getAll', async (_, thunkAPI) => {
  try {
    const response = await roleService.getAll();
    return response.data; // API trả về { data: [...] }
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = action.payload;
      });
  },
});

export default roleSlice.reducer;