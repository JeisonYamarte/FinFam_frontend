import type { Home } from '@/features/homes/domain/Home.entity'
import type { IHomeRepository } from '@/features/homes/domain/Home.repository'

export class GetHomes {
  private readonly repository: IHomeRepository

  constructor(repository: IHomeRepository) {
    this.repository = repository
  }

  execute(): Promise<Home[]> {
    return this.repository.getHomes()
  }
}