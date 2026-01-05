import { API_BASE_URL } from './url';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
  params?: Record<string, any>; // 1. Thêm dòng này để nhận params
}

async function request(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, headers = {}, isFormData = false, params } = options;

  const token = localStorage.getItem('accessToken');

  // 2. Logic xử lý Params (ghép ?key=value vào URL)
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    // Lọc bỏ các giá trị null/undefined/rỗng để URL sạch đẹp
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);

    const queryString = new URLSearchParams(cleanParams).toString();
    
    // Nối vào URL
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // 3. Cấu hình Headers
  const configHeaders: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : '',
    ...headers,
  };

  if (!isFormData) {
    configHeaders['Content-Type'] = 'application/json';
  }

  const configBody = isFormData ? body : (body ? JSON.stringify(body) : undefined);

  // 4. Gọi Fetch
  const response = await fetch(url, {
    method,
    headers: configHeaders,
    body: configBody,
  });

  return response;
}

export const api = {
  // 5. Cập nhật hàm get để nhận tham số options
  get: (endpoint: string, options?: { params?: Record<string, any> }) => 
    request(endpoint, { method: 'GET', params: options?.params }),

  post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body }),
  del: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint: string, body: FormData) => request(endpoint, { method: 'POST', body, isFormData: true }),
};