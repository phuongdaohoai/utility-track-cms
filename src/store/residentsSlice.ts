// store/residentsSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import residentsService from '../services/residentsService';


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
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
 
  },
});

export default residentsSlice.reducer;