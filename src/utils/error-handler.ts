// src/utils/error-handler.ts
import { ERROR_MESSAGES } from '../constants/error-messages';

// Lấy ngôn ngữ từ localStorage (theo LocaleContext)
const getCurrentLanguage = (): string => {
  const savedLocale = localStorage.getItem('app_locale');
  return savedLocale === 'en' || savedLocale === 'vi' ? savedLocale : 'vi'; 
};

interface ErrorResponse {
  errorCode?: string;
  message?: string;
  details?: Record<string, any>; // Dành cho các biến động (ví dụ: tên file lỗi)
}

export const getTranslatableError = (errorData: ErrorResponse | null, httpStatus?: number): string => {
  const lang = getCurrentLanguage();
  const dictionary = ERROR_MESSAGES[lang] || ERROR_MESSAGES['vi'];

  // 1. Ưu tiên: Check errorCode từ Backend
  if (errorData?.errorCode) {
    let message = dictionary[errorData.errorCode];

    // Nếu tìm thấy mã lỗi trong từ điển
    if (message) {
      // Xử lý Dynamic text (nếu có). VD: "File {{fileName}} lỗi"
      if (errorData.details) {
        Object.keys(errorData.details).forEach((key) => {
          message = message.replace(`{{${key}}}`, errorData.details![key]);
        });
      }
      return message;
    }
  }

  // 2. Fallback 1: Nếu không map được code, lấy message gốc từ Backend gửi về
  if (errorData?.message) {
    return errorData.message;
  }

  // 3. Fallback 2: Dựa vào HTTP Status Code (khi BE sập hoặc lỗi mạng)
  switch (httpStatus) {
    case 400: return 'Dữ liệu gửi đi không hợp lệ.';
    case 401: return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    case 403: return 'Bạn không có quyền thực hiện thao tác này.';
    case 404: return 'Không tìm thấy dữ liệu yêu cầu.';
    case 500: return 'Lỗi hệ thống máy chủ (500).';
    case 502: return 'Lỗi cổng kết nối (Bad Gateway).';
    case 503: return 'Hệ thống đang bảo trì.';
    default: return dictionary['UNKNOWN_ERROR'] || 'Lỗi không xác định.';
  }
};