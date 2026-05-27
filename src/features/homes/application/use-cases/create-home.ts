import type { CreateHomePayload, Home } from '@/features/homes/domain/Home.entity'
import type { IHomeRepository } from '@/features/homes/domain/Home.repository'

export class CreateHome {
  private readonly repository: IHomeRepository

  constructor(repository: IHomeRepository) {
    this.repository = repository
  }

  execute(payload: CreateHomePayload): Promise<Home> {
    return this.repository.createHome(payload)
  }
}