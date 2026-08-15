export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Category = {
  id: string;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  transactionsCount: number;
  totalAmount: number;
  createdAt: string;
};

export type TransactionType = "INCOME" | "EXPENSE";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  createdAt: string;
  category: Category;
};

export type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalCategories: number;
  totalTransactions: number;
  mostUsedCategory?: Category | null;
  recentTransactions: Transaction[];
  categorySummaries: Category[];
};
