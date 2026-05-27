import type {
  CreateHomePayload,
  Home,
  HomeCalculation,
  HomeClosure,
  HomeDetail,
  HomeExpense,
  InviteHomeMemberPayload,
  UpdateHomeMemberRolePayload,
  UpdateHomeNamePayload,
} from './Home.entity'

export interface IHomeRepository {
  getHomes(): Promise<Home[]>
  createHome(payload: CreateHomePayload): Promise<Home>
  getHomeById(homeId: string): Promise<HomeDetail>
  getHomeCalculation(homeId: string): Promise<HomeCalculation>
  getHomeExpenses(homeId: string, limit: number): Promise<HomeExpense[]>
  getHomeClosures(homeId: string, limit: number): Promise<HomeClosure[]>
  updateHomeName(homeId: string, payload: UpdateHomeNamePayload): Promise<HomeDetail>
  inviteHomeMember(homeId: string, payload: InviteHomeMemberPayload): Promise<void>
  updateHomeMemberRole(
    homeId: string,
    memberId: string,
    payload: UpdateHomeMemberRolePayload,
  ): Promise<void>
  removeHomeMember(homeId: string, memberId: string): Promise<void>
  leaveHome(homeId: string): Promise<void>
}