import { API_BASE_URL } from './url';
import { getTranslatableError } from './error-handler'; // Import hàm dịch lỗi

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
  params?: Record<string, any>;
}

// 🔥 Sửa kiểu trả về từ Promise<Response> thành Promise<T> (trả về data luôn)
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, isFormData = false, params } = options;

  const token = localStorage.getItem('accessToken');

  // 1. Logic xử lý Params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);
    const queryString = new URLSearchParams(cleanParams).toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // 2. Cấu hình Headers
  const configHeaders: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : '',
    ...headers,
  };

  if (!isFormData) {
    configHeaders['Content-Type'] = 'application/json';
  }

  const configBody = isFormData ? body : (body ? JSON.stringify(body) : undefined);

  // 3. Gọi Fetch
  try {
    const response = await fetch(url, {
      method,
      headers: configHeaders,
      body: configBody,
    });

    // 🔥 Bước quan trọng: Đọc JSON ngay tại đây để check errorCode
    let data: any;
    const contentType = response.headers.get("content-type");
    
    // Kiểm tra xem response có phải JSON không
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      // Nếu không phải JSON (ví dụ text hoặc blob), xử lý tùy ý hoặc return text
      data = await response.text(); 
    }

    // 🔥 4. Check lỗi Logic (errorCode từ Backend)
    if (data && data.errorCode) {
      const translatedMessage = getTranslatableError(data);
      throw new Error(translatedMessage); // Ném lỗi ra để Component/Service bắt
    }

    // 🔥 5. Check lỗi HTTP (401, 403, 500...)
    if (!response.ok) {
      const translatedMessage = getTranslatableError(data, response.status);
      throw new Error(translatedMessage);
    }

    // Trả về data đã parse
    return data as T;

  } catch (error: any) {
    // Nếu là lỗi mạng (Network Error) hoặc lỗi do mình throw ở trên
    // Nếu chưa có message (lỗi mạng thuần túy), gán message mặc định
    if (!error.message || error.message === 'Failed to fetch') {
      throw new Error('Không thể kết nối đến máy chủ.');
    }
    throw error;
  }
}

export const api = {
  // Cập nhật kiểu trả về Generic <T>
  get: <T = any>(endpoint: string, options?: { params?: Record<string, any> }) => 
    request<T>(endpoint, { method: 'GET', params: options?.params }),

  post: <T = any>(endpoint: string, body: any) => 
    request<T>(endpoint, { method: 'POST', body }),

  put: <T = any>(endpoint: string, body: any) => 
    request<T>(endpoint, { method: 'PUT', body }),

  del: <T = any>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),

  upload: <T = any>(endpoint: string, body: FormData) => 
    request<T>(endpoint, { method: 'POST', body, isFormData: true }),
};