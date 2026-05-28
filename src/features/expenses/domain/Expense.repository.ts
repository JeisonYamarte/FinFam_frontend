import type {
  CreateExpensePayload,
  Expense,
  ExpenseListFilters,
  ExpenseListResult,
  UpdateExpensePayload,
} from './Expense.entity'

export interface IExpenseRepository {
  getExpenses(householdId: string, filters?: ExpenseListFilters): Promise<ExpenseListResult>
  getExpenseById(expenseId: string): Promise<Expense>
  createExpense(payload: CreateExpensePayload): Promise<Expense>
  updateExpense(expenseId: string, payload: UpdateExpensePayload): Promise<Expense>
  deleteExpense(expenseId: string): Promise<void>
}
