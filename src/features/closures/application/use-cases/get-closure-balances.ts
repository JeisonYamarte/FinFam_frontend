import type { ClosureBalance } from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class GetClosureBalances {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(closureId: string): Promise<ClosureBalance[]> {
    return this.repo.getBalances(closureId)
  }
}