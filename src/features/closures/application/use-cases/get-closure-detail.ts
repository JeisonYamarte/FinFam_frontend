import type { ClosureDetail } from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class GetClosureDetail {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(closureId: string): Promise<ClosureDetail> {
    return this.repo.getById(closureId)
  }
}