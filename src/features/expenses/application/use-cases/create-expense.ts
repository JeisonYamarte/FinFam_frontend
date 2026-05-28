import type {
  CreateExpensePayload,
  Expense,
} from '@/features/expenses/domain/Expense.entity'
import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'

export class CreateExpense {
  private readonly expenseRepository: IExpenseRepository

  constructor(expenseRepository: IExpenseRepository) {
    this.expenseRepository = expenseRepository
  }

  execute(payload: CreateExpensePayload): Promise<Expense> {
    return this.expenseRepository.createExpense(payload)
  }
}
