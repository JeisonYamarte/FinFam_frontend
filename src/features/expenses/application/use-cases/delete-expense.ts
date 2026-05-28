import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'

export class DeleteExpense {
  private readonly expenseRepository: IExpenseRepository

  constructor(expenseRepository: IExpenseRepository) {
    this.expenseRepository = expenseRepository
  }

  execute(expenseId: string): Promise<void> {
    return this.expenseRepository.deleteExpense(expenseId)
  }
}
