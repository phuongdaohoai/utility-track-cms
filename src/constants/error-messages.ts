// src/constants/error-messages.ts

export const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  vi: {
    // --- AUTH MODULE ---
    AUTH_INVALID_CREDENTIALS: 'Sai email hoặc mật khẩu.',
    AUTH_ACCOUNT_NOT_FOUND: 'Tài khoản không tồn tại.',
    AUTH_INVALID_PASSWORD: 'Mật khẩu không chính xác.',
    AUTH_NO_ROLE_ASSIGNED: 'Tài khoản chưa được phân quyền.',
    AUTH_ROLE_NOT_FOUND: 'Vai trò người dùng không tồn tại.',
    AUTH_NO_PERMISSIONS: 'Bạn không có quyền truy cập.',
    AUTH_FORBIDDEN: 'Truy cập bị từ chối.',
    AUTH_MISSING_PERMISSION: 'Bạn thiếu quyền để thực hiện thao tác này.',

    // --- RESIDENT MODULE ---
    RESIDENT_NOT_FOUND: 'Không tìm thấy thông tin cư dân.',
    RESIDENT_IMPORT_DUPLICATE_PHONE: 'Số điện thoại trong file import bị trùng lặp.',
    RESIDENT_IMPORT_DUPLICATE_CCCD: 'CCCD trong file import bị trùng lặp.',
    RESIDENT_IMPORT_DUPLICATE_EMAIL: 'Email trong file import bị trùng lặp.',
    RESIDENT_APARTMENT_NOT_FOUND: 'Không tìm thấy căn hộ tương ứng.',

    // --- SERVICE MODULE ---
    SERVICE_NOT_FOUND: 'Dịch vụ không tồn tại.',
    SERVICE_NAME_EXISTS: 'Tên dịch vụ đã tồn tại.',
    SERVICE_NAME_IN_USE_BY_OTHER: 'Tên dịch vụ đang được sử dụng bởi dịch vụ khác.',

    // --- STAFF MODULE ---
    STAFF_NOT_FOUND: 'Không tìm thấy nhân viên.',
    STAFF_EMAIL_IN_USE_BY_OTHER: 'Email này đã được sử dụng bởi nhân viên khác.',
    STAFF_PHONE_IN_USE_BY_OTHER: 'Số điện thoại này đã được sử dụng bởi nhân viên khác.',
    STAFF_CANNOT_DELETE_SELF: 'Bạn không thể tự xóa tài khoản của chính mình.',
    STAFF_CANNOT_DELETE_SUPER_ADMIN: 'Không thể xóa tài khoản Quản trị viên cấp cao.',

    // --- COMMON / VALIDATE ---
    PHONE_EXISTS: 'Số điện thoại đã tồn tại trong hệ thống.',
    EMAIL_EXISTS: 'Email đã tồn tại trong hệ thống.',
    CCCD_EXISTS: 'CCCD đã tồn tại trong hệ thống.',
    VERSION_CONFLICT: 'Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại trang.',
    ALREADY_DELETED: 'Dữ liệu này đã bị xóa trước đó.',
    
    // --- CHECKIN MODULE ---
    CHECKIN_NO_ACTIVE_CHECKIN: 'Không tìm thấy lượt Check-in nào đang hoạt động.',
    
    // Default fallback
    UNKNOWN_ERROR: 'Đã có lỗi xảy ra, vui lòng thử lại.',
  },
  en: {
    // --- AUTH MODULE ---
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
    AUTH_ACCOUNT_NOT_FOUND: 'Account not found.',
    AUTH_INVALID_PASSWORD: 'Invalid password.',
    AUTH_NO_ROLE_ASSIGNED: 'Account has not been assigned a role.',
    AUTH_ROLE_NOT_FOUND: 'User role does not exist.',
    AUTH_NO_PERMISSIONS: 'You do not have access permission.',
    AUTH_FORBIDDEN: 'Access denied.',
    AUTH_MISSING_PERMISSION: 'You lack permission to perform this action.',

    // --- RESIDENT MODULE ---
    RESIDENT_NOT_FOUND: 'Resident information not found.',
    RESIDENT_IMPORT_DUPLICATE_PHONE: 'Phone number in import file is duplicated.',
    RESIDENT_IMPORT_DUPLICATE_CCCD: 'CCCD in import file is duplicated.',
    RESIDENT_IMPORT_DUPLICATE_EMAIL: 'Email in import file is duplicated.',
    RESIDENT_APARTMENT_NOT_FOUND: 'Corresponding apartment not found.',

    // --- SERVICE MODULE ---
    SERVICE_NOT_FOUND: 'Service does not exist.',
    SERVICE_NAME_EXISTS: 'Service name already exists.',
    SERVICE_NAME_IN_USE_BY_OTHER: 'Service name is being used by another service.',

    // --- STAFF MODULE ---
    STAFF_NOT_FOUND: 'Staff not found.',
    STAFF_EMAIL_IN_USE_BY_OTHER: 'This email is already used by another staff member.',
    STAFF_PHONE_IN_USE_BY_OTHER: 'This phone number is already used by another staff member.',
    STAFF_CANNOT_DELETE_SELF: 'You cannot delete your own account.',
    STAFF_CANNOT_DELETE_SUPER_ADMIN: 'Cannot delete Super Administrator account.',

    // --- COMMON / VALIDATE ---
    PHONE_EXISTS: 'Phone number already exists in the system.',
    EMAIL_EXISTS: 'Email already exists in the system.',
    CCCD_EXISTS: 'CCCD already exists in the system.',
    VERSION_CONFLICT: 'Data has been changed by someone else. Please reload the page.',
    ALREADY_DELETED: 'This data has been deleted previously.',
    
    // --- CHECKIN MODULE ---
    CHECKIN_NO_ACTIVE_CHECKIN: 'No active Check-in found.',
    
    // Default fallback
    UNKNOWN_ERROR: 'An error occurred, please try again.',
  }
};