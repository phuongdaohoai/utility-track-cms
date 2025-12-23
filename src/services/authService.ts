// services/authService.ts
import axios from 'axios';

import { API_BASE_URL } from '../utils/url';

export interface LoginCredentials {
  identifier?: string; // keep compatibility with previous code (email or phone)
  email?: string;
  password: string;
  locale?: 'vi' | 'en';
}

// token payload theo ví dụ bạn đưa
export interface TokenPayload {
  staffId?: number;
  email?: string;
  role?: string;
  fullname?: string;
  avatar?: string;
  permissions?: string[];
  sub?: number;
  jti?: string;
  iat?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  token: string; // raw accessToken
}


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {

  const body = {
    email: credentials.email ?? credentials.identifier,
    password: credentials.password,
  };


  const res = await api.post('/auth/login', body);

  const accessToken: string | undefined = res?.data?.accessToken;

  if (!accessToken) {
    throw new Error('No access token returned from server');
  }

  // decode token để lấy payload
  let payload: TokenPayload;
  try {
    payload = parseJwt<TokenPayload>(accessToken);
    

  } catch (e) {
    console.warn('Failed to decode JWT', e);
    throw new Error('Invalid token from server');
  }

  // build user object từ payload (quan trọng: mapping theo token của bạn)
  const user: User = {
    id: (payload.staffId ?? payload.sub) as number,
    email: payload.email ?? body.email ?? "",
    name: payload.fullname ?? payload.email ?? 'Unknown',
    avatar: payload.avatar,
    role: payload.role,
    permissions: payload.permissions ?? [],
  };
   localStorage.setItem('accessToken', accessToken);
   localStorage.setItem('currentUser', JSON.stringify(user));


  return {
    user,
    token: accessToken,
  };
};
export function parseJwt<T = any>(token: string): T {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid JWT format');

    // chuyển base64Url → base64 chuẩn
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // decode base64 → chuỗi JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as T;
  } catch (err) {
    console.error('[parseJwt] Failed to decode token:', err);
    throw new Error('Invalid token');
  }
}


export default { login };
