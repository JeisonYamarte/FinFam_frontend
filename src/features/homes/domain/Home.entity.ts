export type HomeRole = 'ADMIN' | 'GUEST'

export interface Home {
  id: string
  name: string
  role: HomeRole
  membersCount: number
}

export interface HomeMember {
  id: string
  userId: string
  name: string
  email: string
  role: HomeRole
}

export interface HomeExpense {
  id: string
  title: string
  closureId: string | null
  date: string
  amount: number
}

export interface HomeClosure {
  id: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface HomeCalculation {
  period: {
    startDate: string | null
    endDate: string | null
  }
  openExpensesCount: number
  totalSpentOpenPeriod: number
  totalsByUser: Record<
    string,
    {
      paid: number
      split: number
      net: number
    }
  >
}

export interface HomeDetail {
  id: string
  name: string
  createdAt: string
  membersCount: number
  members: HomeMember[]
}

export type CreateHomePayload = {
  name: string
}

export type UpdateHomeNamePayload = {
  name: string
}

export type InviteHomeMemberPayload = {
  email: string
}

export type UpdateHomeMemberRolePayload = {
  role: HomeRole
}

export interface HomeListItemResponse {
  id: string
  name: string
  role: HomeRole
}

export interface HomeCreateResponse {
  id: string
  name: string
  createdAt: string
}

export interface HomeByIdResponse {
  id: string
  name: string
  createdAt: string
  membersCount: number
}

export interface HomeMemberResponse {
  id: string
  userId: string
  name: string
  email: string
  role: HomeRole
}

export interface HomeClosureResponse {
  id: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface HomeExpenseResponse {
  id: string
  title: string
  amount: number
  date: string
  closureId: string | null
}

export interface HomeExpensesResponse {
  data: HomeExpenseResponse[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface HomeCalculationResponse {
  period: {
    startDate: string | null
    endDate: string | null
  }
  openExpensesCount: number
  totalSpentOpenPeriod: number
  totalsByUser: Record<
    string,
    {
      paid: number
      split: number
      net: number
    }
  >
}

export interface UpdateHomeResponse {
  id: string
  name: string
  updatedAt: string
}