"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { ReportsToolbar } from "@/components/reports/reports-toolbar"
import { KeyMetrics } from "@/components/reports/key-metrics"
import { SpendingTrendsChart } from "@/components/reports/spending-trends-chart"
import { IncomeTrendsChart } from "@/components/reports/income-trends-chart"
import { BudgetPerformanceChart } from "@/components/reports/budget-performance-chart"
import { CategoryBreakdownChart } from "@/components/reports/category-breakdown-chart"
import { FinancialInsights } from "@/components/reports/financial-insights"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"

// Mock data for reports
const mockSpendingTrends = [
  { month: "Aug", spending: 3200, previousYear: 2800 },
  { month: "Sep", spending: 3800, previousYear: 3200 },
  { month: "Oct", spending: 3500, previousYear: 3600 },
  { month: "Nov", spending: 4100, previousYear: 3900 },
  { month: "Dec", spending: 4500, previousYear: 4200 },
  { month: "Jan", spending: 3500, previousYear: 3100 },
]

const mockIncomeTrends = [
  { month: "Aug", income: 5000, recurring: 4500, oneTime: 500 },
  { month: "Sep", income: 5200, recurring: 4500, oneTime: 700 },
  { month: "Oct", income: 4800, recurring: 4500, oneTime: 300 },
  { month: "Nov", income: 5500, recurring: 4500, oneTime: 1000 },
  { month: "Dec", income: 5800, recurring: 4500, oneTime: 1300 },
  { month: "Jan", income: 5000, recurring: 4500, oneTime: 500 },
]

const mockBudgetPerformance = [
  { category: "Food", budgeted: 500, spent: 520, variance: 20 },
  { category: "Transport", budgeted: 200, spent: 145, variance: -55 },
  { category: "Entertainment", budgeted: 150, spent: 85, variance: -65 },
  { category: "Utilities", budgeted: 300, spent: 280, variance: -20 },
  { category: "Shopping", budgeted: 250, spent: 320, variance: 70 },
]

const mockSpendingBreakdown = [
  { name: "Food", value: 520, color: "#ef4444" },
  { name: "Transportation", value: 145, color: "#3b82f6" },
  { name: "Entertainment", value: 85, color: "#8b5cf6" },
  { name: "Utilities", value: 280, color: "#f59e0b" },
  { name: "Shopping", value: 320, color: "#10b981" },
]

const mockIncomeBreakdown = [
  { name: "Salary", value: 4500, color: "#22c55e" },
  { name: "Freelance", value: 300, color: "#3b82f6" },
  { name: "Investments", value: 150, color: "#8b5cf6" },
  { name: "Other", value: 50, color: "#f59e0b" },
]

const mockKeyMetrics = {
  avgMonthlySpending: 3750,
  avgMonthlyIncome: 5200,
  savingsRate: 27.9,
  budgetAdherence: 78.5,
  netWorthGrowth: 12.3,
  expenseRatio: 72.1,
}

const mockInsights = [
  {
    id: "1",
    type: "positive" as const,
    title: "Great Savings Rate",
    description: "You're saving 28% of your income, which is above the recommended 20%.",
    value: "28% saved",
    trend: "up" as const,
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Food Budget Exceeded",
    description: "You've spent $20 more than budgeted on food this month.",
    value: "$20 over",
  },
  {
    id: "3",
    type: "positive" as const,
    title: "Transportation Savings",
    description: "You're spending 27% less on transportation compared to last month.",
    value: "$55 saved",
    trend: "down" as const,
  },
  {
    id: "4",
    type: "info" as const,
    title: "Income Stability",
    description: "Your income has been consistent over the past 6 months.",
    value: "Stable",
  },
  {
    id: "5",
    type: "negative" as const,
    title: "Shopping Increase",
    description: "Shopping expenses have increased by 40% compared to last month.",
    value: "+40%",
    trend: "up" as const,
  },
  {
    id: "6",
    type: "positive" as const,
    title: "Net Worth Growth",
    description: "Your net worth has grown by 12.3% this year.",
    value: "+12.3%",
    trend: "up" as const,
  },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("6m")
  const [accountFilter, setAccountFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const { toast } = useToast()

  const handleExport = (format: string) => {
    toast({
      title: "Export started",
      description: `Generating ${format.toUpperCase()} report...`,
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Data refreshed",
      description: "Reports have been updated with the latest data.",
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          </div>

          <ReportsToolbar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            accountFilter={accountFilter}
            onAccountFilterChange={setAccountFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onExport={handleExport}
            onRefresh={handleRefresh}
          />

          <KeyMetrics metrics={mockKeyMetrics} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SpendingTrendsChart data={mockSpendingTrends} />
            <IncomeTrendsChart data={mockIncomeTrends} />
          </div>

          <BudgetPerformanceChart data={mockBudgetPerformance} />

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart
              data={mockSpendingBreakdown}
              title="Spending by Category"
              description="Where your money goes this month"
            />
            <CategoryBreakdownChart
              data={mockIncomeBreakdown}
              title="Income by Source"
              description="Your income streams this month"
            />
          </div>

          <FinancialInsights insights={mockInsights} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
