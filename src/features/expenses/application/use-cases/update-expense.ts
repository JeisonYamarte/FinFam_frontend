import type {
  Expense,
  UpdateExpensePayload,
} from '@/features/expenses/domain/Expense.entity'
import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'

export class UpdateExpense {
  private readonly expenseRepository: IExpenseRepository

  constructor(expenseRepository: IExpenseRepository) {
    this.expenseRepository = expenseRepository
  }

  execute(expenseId: string, payload: UpdateExpensePayload): Promise<Expense> {
    return this.expenseRepository.updateExpense(expenseId, payload)
  }
}
