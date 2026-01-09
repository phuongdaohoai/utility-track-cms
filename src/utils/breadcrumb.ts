// src/utils/breadcrumb.ts
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

export interface BreadcrumbItem {
  label: string
  path?: string
}

export const getBreadcrumb = (pathname: string, locale: Locale = 'vi'): BreadcrumbItem[] => {
  const t = translations[locale]

  // Dashboard
  if (pathname === '/admin') {
    return [{ label: t.sidebar.dashboard }]
  }

  // USERS - danh sách
  if (pathname === '/admin/users') {
    return [
      { label: t.sidebar.manageUsers },
      { label: t.users.residentsList },
    ]
  }

  // USERS - chỉnh sửa
  if (pathname.startsWith('/admin/users/') && pathname.endsWith('/edit')) {
    return [
      { label: t.sidebar.manageUsers },
      { label: t.users.residentsList, path: '/admin/users' },
      { label: t.common.edit },
    ]
  }

  // SERVICES - danh sách
  if (pathname === '/admin/services') {
    return [
      { label: t.sidebar.manageServices },
      { label: t.services.list },
    ]
  }

  // SERVICES - chi tiết / sửa chữa
  if (pathname.startsWith('/admin/services/')) {
    return [
      { label: t.sidebar.manageServices },
      { label: t.services.list, path: '/admin/services' },
      { label: t.services.detail },
    ]
  }

  // HISTORY
  if (pathname === '/admin/history') {
    return [
      { label: t.sidebar.usageHistory },
    ]
  }

  // SETTINGS
  if (pathname === '/admin/settings') {
    return [
      { label: t.sidebar.systemConfig },
    ]
  }
 // CHECKOUT
  if (pathname === '/admin/checkout') {
    return [
      { label: "Checkout"},
    ]
  }
  return []
}
