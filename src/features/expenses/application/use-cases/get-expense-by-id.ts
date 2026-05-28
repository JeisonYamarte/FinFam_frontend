import type { Expense } from '@/features/expenses/domain/Expense.entity'
import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'

export class GetExpenseById {
  private readonly expenseRepository: IExpenseRepository

  constructor(expenseRepository: IExpenseRepository) {
    this.expenseRepository = expenseRepository
  }

  execute(expenseId: string): Promise<Expense> {
    return this.expenseRepository.getExpenseById(expenseId)
  }
}
