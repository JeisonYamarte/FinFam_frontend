import type {
  ClosureBalance,
  ClosureCreateResult,
  ClosureDetail,
  ClosureExpense,
  ClosureHistoryItem,
  ClosureSimulation,
  CreateClosurePayload,
  SimulateClosurePayload,
} from './Closure.entity'

export interface IClosureRepository {
  listByHousehold(householdId: string, limit?: number): Promise<ClosureHistoryItem[]>
  simulate(payload: SimulateClosurePayload): Promise<ClosureSimulation>
  create(payload: CreateClosurePayload): Promise<ClosureCreateResult>
  getById(closureId: string): Promise<ClosureDetail>
  getBalances(closureId: string): Promise<ClosureBalance[]>
  getExpenses(closureId: string): Promise<ClosureExpense[]>
}