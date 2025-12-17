// src/utils/breadcrumb.ts

export interface BreadcrumbItem {
  label: string
  path?: string
}

export const getBreadcrumb = (pathname: string): BreadcrumbItem[] => {

  // Dashboard
  if (pathname === '/admin') {
    return [{ label: 'Dashboard tổng quan' }]
  }

  // USERS - danh sách
  if (pathname === '/admin/users') {
    return [
      { label: 'Quản lý Cư dân' },
      { label: 'Danh sách Cư dân' },
    ]
  }

  // USERS - chỉnh sửa
  if (pathname.startsWith('/admin/users/') && pathname.endsWith('/edit')) {
    return [
      { label: 'Quản lý Cư dân' },
      { label: 'Danh sách Cư dân', path: '/admin/users' },
      { label: 'Chỉnh sửa thông tin' },
    ]
  }

  // SERVICES - danh sách
  if (pathname === '/admin/services') {
    return [
      { label: 'Quản lý Dịch vụ' },
      { label: 'Danh sách Dịch vụ' },
    ]
  }

  // SERVICES - chi tiết / sửa chữa
  if (pathname.startsWith('/admin/services/')) {
    return [
      { label: 'Quản lý Dịch vụ' },
      { label: 'Danh sách Dịch vụ', path: '/admin/services' },
      { label: 'Chi tiết dịch vụ' },
    ]
  }

  // HISTORY
  if (pathname === '/admin/history') {
    return [
      { label: 'Lịch sử Checkin' },
    ]
  }

  // SETTINGS
  if (pathname === '/admin/settings') {
    return [
      { label: 'Cấu hình hệ thống' },
    ]
  }

  return []
}
