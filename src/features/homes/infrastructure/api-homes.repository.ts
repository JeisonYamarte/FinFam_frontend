import { client } from '@/shared/infrastructure/http/client'

import type {
  CreateHomePayload,
  Home,
  HomeByIdResponse,
  HomeCalculation,
  HomeCalculationEntryResponse,
  HomeClosure,
  HomeClosureResponse,
  HomeCreateResponse,
  HomeDetail,
  HomeExpense,
  HomeExpensesResponse,
  HomeListItemResponse,
  HomeMember,
  HomeMemberResponse,
  HomeExpenseResponse,
  InviteHomeMemberPayload,
  UpdateHomeMemberRolePayload,
  UpdateHomeNamePayload,
} from '../domain/Home.entity'
import type { IHomeRepository } from '../domain/Home.repository'

const mapHome = (home: HomeListItemResponse): Home => ({
  id: home.id,
  name: home.name,
  role: home.role,
  membersCount: 0,
})

const mapMember = (member: HomeMemberResponse): HomeMember => ({
  id: member.id,
  userId: member.userId,
  name: member.name,
  email: member.email,
  role: member.role,
})

const mapHomeDetail = (home: HomeByIdResponse, members: HomeMemberResponse[]): HomeDetail => ({
  id: home.id,
  name: home.name,
  createdAt: home.createdAt,
  membersCount: home.membersCount,
  members: members.map(mapMember),
})

const mapCalculation = (items: HomeCalculationEntryResponse[]): HomeCalculation => {
  const totalSpent = items.reduce((acc, item) => acc + item.amount, 0)
  const members = new Set<string>()

  for (const item of items) {
    item.payers.forEach((payer) => members.add(payer.userId))
    item.splits.forEach((split) => members.add(split.userId))
  }

  return {
    totalSpent,
    balance: 0,
    membersCount: members.size,
  }
}

const mapExpense = (expense: HomeExpenseResponse): HomeExpense => ({
  id: expense.id,
  title: expense.title,
  amount: expense.amount,
  date: expense.date,
  closureId: expense.closureId,
})

const mapClosure = (closure: HomeClosureResponse): HomeClosure => ({
  id: closure.id,
  startDate: closure.startDate,
  endDate: closure.endDate,
  createdAt: closure.createdAt,
})

export class ApiHomesRepository implements IHomeRepository {
  async getHomes(): Promise<Home[]> {
    const { data } = await client.get<HomeListItemResponse[]>('/homes')
    return data.map(mapHome)
  }

  async createHome(payload: CreateHomePayload): Promise<Home> {
    const { data } = await client.post<HomeCreateResponse>('/homes', payload)

    return {
      id: data.id,
      name: data.name,
      role: 'ADMIN',
      membersCount: 1,
    }
  }

  async getHomeById(homeId: string): Promise<HomeDetail> {
    const [{ data: homeData }, { data: membersData }] = await Promise.all([
      client.get<HomeByIdResponse>(`/homes/${homeId}`),
      client.get<HomeMemberResponse[]>(`/homes/${homeId}/members`),
    ])

    return mapHomeDetail(homeData, membersData)
  }

  async getHomeCalculation(homeId: string): Promise<HomeCalculation> {
    const { data } = await client.get<HomeCalculationEntryResponse[]>(
      `/households/${homeId}/expenses/calculation`,
    )

    return mapCalculation(data)
  }

  async getHomeExpenses(homeId: string, limit: number): Promise<HomeExpense[]> {
    const { data } = await client.get<HomeExpensesResponse>(`/households/${homeId}/expenses`, {
      params: { limit },
    })

    return data.data.map(mapExpense)
  }

  async getHomeClosures(homeId: string, limit: number): Promise<HomeClosure[]> {
    const { data } = await client.get<HomeClosureResponse[]>(`/households/${homeId}/closures`, {
      params: { limit },
    })

    return data.map(mapClosure)
  }

  async updateHomeName(homeId: string, payload: UpdateHomeNamePayload): Promise<HomeDetail> {
    await client.patch(`/homes/${homeId}`, payload)
    return this.getHomeById(homeId)
  }

  async inviteHomeMember(homeId: string, payload: InviteHomeMemberPayload): Promise<void> {
    await client.post(`/homes/${homeId}/invitations`, payload)
  }

  async updateHomeMemberRole(
    homeId: string,
    memberId: string,
    payload: UpdateHomeMemberRolePayload,
  ): Promise<void> {
    await client.patch(`/homes/${homeId}/members/${memberId}/role`, payload)
  }

  async removeHomeMember(homeId: string, memberId: string): Promise<void> {
    await client.delete(`/homes/${homeId}/members/${memberId}`)
  }

  async leaveHome(homeId: string): Promise<void> {
    await client.post(`/homes/${homeId}/leave`)
  }
}

export const apiHomesRepository = new ApiHomesRepository()
