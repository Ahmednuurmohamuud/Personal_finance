"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { NetWorthChart } from "@/components/dashboard/net-worth-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { DashboardControls } from "@/components/dashboard/dashboard-controls"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  mockAccounts,
  mockBudgets,
  mockRecurringBills,
  mockSpendingData,
  mockIncomeExpenseData,
  mockNetWorthData,
} from "@/lib/mock-data"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [accountFilter, setAccountFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Calculate totals from mock data
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0)
  const monthlyIncome = 5000
  const monthlyExpenses = -3500
  const netWorth = 41650

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <DashboardControls
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            accountFilter={accountFilter}
            onAccountFilterChange={setAccountFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
          />

          <StatsCards
            totalBalance={totalBalance}
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            netWorth={netWorth}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <SpendingChart data={mockSpendingData} />
            <IncomeExpenseChart data={mockIncomeExpenseData} />
          </div>

          <NetWorthChart data={mockNetWorthData} />

          <div className="grid gap-6 md:grid-cols-2">
            <UpcomingBills bills={mockRecurringBills} />
            <BudgetProgress budgets={mockBudgets} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
