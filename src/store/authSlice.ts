import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import authService, { LoginCredentials, AuthResponse } from '../services/authService'

export interface User {
  id?: number
  email?: string
  name?: string
  avatar?: string | null
  role?: string
  permissions?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null,
  
  permissions?: string[],
}
// 2. Xử lý logic lấy dữ liệu từ localStorage an toàn
const getInitialState = (): AuthState => {
  const storedToken = localStorage.getItem('accessToken');
  const storedUserStr = localStorage.getItem('currentUser');

  let parsedUser: User | null = null;
  let parsedPermissions: string[] = [];

  if (storedUserStr) {
    try {
      parsedUser = JSON.parse(storedUserStr);
    
      parsedPermissions = parsedUser?.permissions || []; 
    } catch (e) {
      console.error("Lỗi parse JSON từ localStorage", e);
     
      localStorage.removeItem('currentUser');
    }
  }

  return {
    token: storedToken || null,
    user: parsedUser,
    permissions: parsedPermissions, 
    status: 'idle',
    error: null,
  };
};

const initialState: AuthState = getInitialState();

export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const res = await authService.login(credentials);
      return res;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.status = 'idle';
      state.error = null;
      
     
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
       
        state.permissions = action.payload.user.permissions || []; 
        state.error = null;

    
        localStorage.setItem('accessToken', action.payload.token);
       
        localStorage.setItem('currentUser', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action: any) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
  },
})

export const { logout } = authSlice.actions


export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

export default authSlice.reducer