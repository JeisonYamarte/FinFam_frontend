import type {
  ClosureSimulation,
  SimulateClosurePayload,
} from '@/features/closures/domain/Closure.entity'
import type { IClosureRepository } from '@/features/closures/domain/Closure.repository'

export class SimulateClosure {
  private readonly repo: IClosureRepository

  constructor(repo: IClosureRepository) {
    this.repo = repo
  }

  execute(payload: SimulateClosurePayload): Promise<ClosureSimulation> {
    return this.repo.simulate(payload)
  }
}