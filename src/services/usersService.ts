import type { User } from '../types'

export interface FetchUsersParams {
  type: 'residents' | 'staff'
  query?: string
  page?: number
  pageSize?: number
}

export interface FetchUsersResult {
  items: User[]
  total: number
  page: number
  pageSize: number
}

// Mock data used for development. Replace with real HTTP calls when backend is ready.
const sampleResidents: User[] = Array.from({ length: 57 }).map((_, i) => ({
  id: i + 1,
  name: `Resident ${String.fromCharCode(65 + (i % 26))} ${i + 1}`,
  role: 'Resident',
  room: (i % 50) + 1,
  phone: '0903582' + String(200 + (i % 800)).slice(0, 3),
  status: i % 3 === 0 ? 'Không hoạt động' : 'Hoạt động',
}))

const sampleStaff: User[] = Array.from({ length: 21 }).map((_, i) => ({
  id: i + 1000,
  name: `Staff ${String.fromCharCode(65 + (i % 26))}`,
  role: i % 2 === 0 ? 'Admin' : 'Manager',
  position: i % 2 === 0 ? 'Admin' : 'Staff',
  phone: '0903582' + String(100 + (i % 900)).slice(0, 3),
  status: i % 2 === 0 ? 'Hoạt động' : 'Không hoạt động',
}))

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResult> => {
  const { type, query = '', page = 1, pageSize = 10 } = params
  // Simulate network
  await delay(450)

  const source = type === 'residents' ? sampleResidents : sampleStaff
  const normalized = query.trim().toLowerCase()

  const filtered = normalized
    ? source.filter((u) => {
        return (
          u.name.toLowerCase().includes(normalized) ||
          (u.phone && u.phone.includes(normalized)) ||
          (u.room && u.room.toString().includes(normalized)) ||
          (u.position && u.position.toLowerCase().includes(normalized))
        )
      })
    : source

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}

export default { fetchUsers }
