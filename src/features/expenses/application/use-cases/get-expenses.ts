import type {
  ExpenseListFilters,
  ExpenseListResult,
} from '@/features/expenses/domain/Expense.entity'
import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'

export class GetExpenses {
  private readonly expenseRepository: IExpenseRepository

  constructor(expenseRepository: IExpenseRepository) {
    this.expenseRepository = expenseRepository
  }

  execute(householdId: string, filters?: ExpenseListFilters): Promise<ExpenseListResult> {
    return this.expenseRepository.getExpenses(householdId, filters)
  }
}
