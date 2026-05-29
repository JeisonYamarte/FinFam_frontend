import type { ClosureHistoryItem } from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class GetClosureHistory {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(householdId: string, limit?: number): Promise<ClosureHistoryItem[]> {
    return this.repo.listByHousehold(householdId, limit)
  }
}