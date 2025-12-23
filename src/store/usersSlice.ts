import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import usersService, { FetchUsersParams, FetchUsersResult } from '../services/usersService'
import type { User } from '../types'

interface UsersState {
  items: User[]
  total: number
  page: number
  pageSize: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  status: 'idle',
  error: null,
}

export const fetchUsers = createAsyncThunk<FetchUsersResult, FetchUsersParams>(
  'users/fetch',
  async (params, thunkAPI) => {
    try {
      const res = await usersService.fetchUsers(params)
      return res
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || 'Failed to fetch users')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload
    },
    clearUsers(state) {
      state.items = []
      state.total = 0
      state.page = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchUsers.rejected, (state, action: any) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message || 'Failed to fetch users'
      })
  },
})

export const { setPage, setPageSize, clearUsers } = usersSlice.actions

export default usersSlice.reducer
