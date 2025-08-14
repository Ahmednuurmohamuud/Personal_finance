export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  account: string
  type: "income" | "expense"
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  status: "active" | "inactive"
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: string
  rollover: boolean
}

export interface RecurringBill {
  id: string
  name: string
  amount: number
  frequency: string
  nextDue: string
  type: "income" | "expense"
  active: boolean
}

export interface ArchivedItem {
  id: string
  name: string
  type: "account" | "budget" | "transaction" | "bill"
  archivedDate: string
  archivedBy: "user" | "system"
}

export interface SearchResult {
  id: string
  type: "transaction" | "account" | "budget" | "bill"
  title: string
  subtitle: string
  amount?: number
  date?: string
  category?: string
  status?: string
  data: Transaction | Account | Budget | RecurringBill
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
  timestamp: Date
  actionUrl?: string
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Salary",
    amount: 5000,
    category: "Income",
    account: "Checking",
    type: "income",
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Grocery Store",
    amount: -120,
    category: "Food",
    account: "Checking",
    type: "expense",
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Gas Station",
    amount: -45,
    category: "Transportation",
    account: "Credit Card",
    type: "expense",
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "Netflix",
    amount: -15,
    category: "Entertainment",
    account: "Checking",
    type: "expense",
  },
  {
    id: "5",
    date: "2024-01-11",
    description: "Coffee Shop",
    amount: -8,
    category: "Food",
    account: "Credit Card",
    type: "expense",
  },
]

export const mockAccounts: Account[] = [
  { id: "1", name: "Checking Account", type: "Checking", balance: 2500, currency: "USD", status: "active" },
  { id: "2", name: "Savings Account", type: "Savings", balance: 15000, currency: "USD", status: "active" },
  { id: "3", name: "Credit Card", type: "Credit", balance: -850, currency: "USD", status: "active" },
  { id: "4", name: "Investment Account", type: "Investment", balance: 25000, currency: "USD", status: "active" },
]

export const mockBudgets: Budget[] = [
  { id: "1", category: "Food", amount: 500, spent: 320, month: "2024-01", rollover: false },
  { id: "2", category: "Transportation", amount: 200, spent: 145, month: "2024-01", rollover: true },
  { id: "3", category: "Entertainment", amount: 150, spent: 85, month: "2024-01", rollover: false },
  { id: "4", category: "Utilities", amount: 300, spent: 280, month: "2024-01", rollover: false },
]

export const mockRecurringBills: RecurringBill[] = [
  { id: "1", name: "Rent", amount: -1200, frequency: "Monthly", nextDue: "2024-02-01", type: "expense", active: true },
  {
    id: "2",
    name: "Internet",
    amount: -80,
    frequency: "Monthly",
    nextDue: "2024-01-25",
    type: "expense",
    active: true,
  },
  { id: "3", name: "Phone", amount: -50, frequency: "Monthly", nextDue: "2024-01-28", type: "expense", active: true },
  { id: "4", name: "Salary", amount: 5000, frequency: "Monthly", nextDue: "2024-02-15", type: "income", active: true },
]

export const mockSpendingData = [
  { name: "Food", value: 320, color: "#8884d8" },
  { name: "Transportation", value: 145, color: "#82ca9d" },
  { name: "Entertainment", value: 85, color: "#ffc658" },
  { name: "Utilities", value: 280, color: "#ff7300" },
  { name: "Shopping", value: 200, color: "#00ff88" },
]

export const mockIncomeExpenseData = [
  { month: "Oct", income: 4800, expenses: 3200 },
  { month: "Nov", income: 5200, expenses: 3800 },
  { month: "Dec", income: 5000, expenses: 4100 },
  { month: "Jan", income: 5000, expenses: 3500 },
]

export const mockNetWorthData = [
  { month: "Oct", netWorth: 38500 },
  { month: "Nov", netWorth: 39900 },
  { month: "Dec", netWorth: 40800 },
  { month: "Jan", netWorth: 41650 },
]

export const archivedItems: ArchivedItem[] = [
  { id: "1", name: "Old Checking Account", type: "account", archivedDate: "2023-12-15", archivedBy: "user" },
  { id: "2", name: "December Food Budget", type: "budget", archivedDate: "2024-01-01", archivedBy: "system" },
  { id: "3", name: "Coffee Purchase", type: "transaction", archivedDate: "2024-01-10", archivedBy: "user" },
  { id: "4", name: "Old Gym Membership", type: "bill", archivedDate: "2023-11-30", archivedBy: "user" },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Budget Alert",
    message: "You've spent 93% of your Utilities budget for January. Consider reviewing your usage.",
    type: "warning",
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    actionUrl: "/budgets",
  },
  {
    id: "2",
    title: "Bill Due Soon",
    message: "Your Internet bill ($80) is due in 3 days on January 25th.",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: "/bills",
  },
  {
    id: "3",
    title: "Transaction Added",
    message: "Successfully added transaction: Grocery Store (-$120)",
    type: "success",
    read: false,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    actionUrl: "/transactions",
  },
  {
    id: "4",
    title: "Low Account Balance",
    message: "Your Checking Account balance is below $3,000. Current balance: $2,500",
    type: "warning",
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: "/accounts",
  },
  {
    id: "5",
    title: "Monthly Report Ready",
    message: "Your January financial report is now available for review.",
    type: "info",
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    actionUrl: "/reports",
  },
  {
    id: "6",
    title: "Budget Exceeded",
    message: "You've exceeded your Food budget by $20 this month.",
    type: "error",
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    actionUrl: "/budgets",
  },
]
