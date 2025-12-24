import { API_BASE_URL } from './url';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

// Hàm này trả về Promise<Response> chuẩn của fetch
async function request(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const token = localStorage.getItem('accessToken');

  // 1. Cấu hình Headers (Tự động gắn Token)
  const configHeaders: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : '',
    ...headers,
  };

  // Tự động thêm Content-Type nếu không phải upload file
  if (!isFormData) {
    configHeaders['Content-Type'] = 'application/json';
  }

  // 2. Cấu hình Body (Tự động stringify)
  const configBody = isFormData ? body : (body ? JSON.stringify(body) : undefined);

  // 3. Gọi Fetch và return luôn Response (không .json() ở đây)
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: configHeaders,
    body: configBody,
  });

  return response;
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body }),
  del: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint: string, body: FormData) => request(endpoint, { method: 'POST', body, isFormData: true }),
};