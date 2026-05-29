import type {
  ClosureCreateResult,
  CreateClosurePayload,
} from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class CreateClosure {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(payload: CreateClosurePayload): Promise<ClosureCreateResult> {
    return this.repo.create(payload)
  }
}