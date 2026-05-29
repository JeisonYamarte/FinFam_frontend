import type { ClosureExpense } from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class GetClosureExpenses {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(closureId: string): Promise<ClosureExpense[]> {
    return this.repo.getExpenses(closureId)
  }
}