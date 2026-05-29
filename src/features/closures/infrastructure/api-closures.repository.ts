import { client } from '@/shared/infrastructure/http/client'

import type {
  ClosureBalance,
  ClosureBalanceResponse,
  ClosureCreateResponse,
  ClosureCreateResult,
  ClosureDetail,
  ClosureDetailResponse,
  ClosureExpense,
  ClosureExpenseResponse,
  ClosureHistoryItem,
  ClosureHistoryItemResponse,
  ClosureMemberBalance,
  ClosureSimulation,
  ClosureSimulationResponse,
  CreateClosurePayload,
  SimulateClosurePayload,
} from '../domain/Closure.entity'
import type { IClosureRepository } from '../domain/Closure.repository'

const mapBalance = (balance: ClosureBalanceResponse): ClosureBalance => ({
  fromUserId: balance.fromUserId,
  toUserId: balance.toUserId,
  amount: balance.amount,
})

const mapHistoryItem = (closure: ClosureHistoryItemResponse): ClosureHistoryItem => ({
  id: closure.id,
  startDate: closure.startDate,
  endDate: closure.endDate,
  createdAt: closure.createdAt,
})

const mapMemberBalance = (balance: ClosureMemberBalance): ClosureMemberBalance => ({
  userId: balance.userId,
  balance: balance.balance,
})

const mapSimulation = (simulation: ClosureSimulationResponse): ClosureSimulation => ({
  period: simulation.period,
  expensesCount: simulation.expensesCount,
  balances: simulation.balances.map(mapMemberBalance),
  debts: simulation.debts.map(mapBalance),
})

const mapCreateResult = (result: ClosureCreateResponse): ClosureCreateResult => ({
  closureId: result.closureId,
  balances: result.balances.map(mapBalance),
})

const mapDetail = (detail: ClosureDetailResponse): ClosureDetail => ({
  id: detail.id,
  householdId: detail.householdId,
  startDate: detail.startDate,
  endDate: detail.endDate,
  createdAt: detail.createdAt,
  updatedAt: detail.updatedAt,
  balances: detail.balances.map(mapBalance),
})

const mapExpense = (expense: ClosureExpenseResponse): ClosureExpense => ({
  id: expense.id,
  title: expense.title,
  description: expense.description,
  amount: expense.amount,
  date: expense.date,
  receiptUrl: expense.receiptUrl,
  receiptPublicId: expense.receiptPublicId,
  householdId: expense.householdId,
  closureId: expense.closureId,
  createdBy: expense.createdBy,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
  payers: expense.payers.map((payer) => ({
    id: payer.id,
    userId: payer.userId,
    amountPaid: payer.amountPaid,
    user: payer.user,
  })),
  splits: expense.splits.map((split) => ({
    id: split.id,
    userId: split.userId,
    amount: split.amount,
    user: split.user,
  })),
})

export class ApiClosuresRepository implements IClosureRepository {
  async listByHousehold(householdId: string, limit?: number): Promise<ClosureHistoryItem[]> {
    const { data } = await client.get<ClosureHistoryItemResponse[]>(`/households/${householdId}/closures`, {
      params: { limit },
    })

    return data.map(mapHistoryItem)
  }

  async simulate(payload: SimulateClosurePayload): Promise<ClosureSimulation> {
    const { data } = await client.post<ClosureSimulationResponse>('/closures/simulate', payload)

    return mapSimulation(data)
  }

  async create(payload: CreateClosurePayload): Promise<ClosureCreateResult> {
    const { data } = await client.post<ClosureCreateResponse>('/closures', payload)

    return mapCreateResult(data)
  }

  async getById(closureId: string): Promise<ClosureDetail> {
    const { data } = await client.get<ClosureDetailResponse>(`/closures/${closureId}`)

    return mapDetail(data)
  }

  async getBalances(closureId: string): Promise<ClosureBalance[]> {
    const { data } = await client.get<ClosureBalanceResponse[]>(`/closures/${closureId}/balances`)

    return data.map(mapBalance)
  }

  async getExpenses(closureId: string): Promise<ClosureExpense[]> {
    const { data } = await client.get<ClosureExpenseResponse[]>(`/closures/${closureId}/expenses`)

    return data.map(mapExpense)
  }
}

export const apiClosuresRepository = new ApiClosuresRepository()