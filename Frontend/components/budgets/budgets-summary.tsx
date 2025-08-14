"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
import type { Budget } from "@/lib/mock-data"

interface BudgetsSummaryProps {
  budgets: Budget[]
}

export function BudgetsSummary({ budgets }: BudgetsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overBudgetCount = budgets.filter((budget) => budget.spent > budget.amount).length
  const onTrackCount = budgets.filter((budget) => {
    const percentage = (budget.spent / budget.amount) * 100
    return percentage <= 80
  }).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
          <p className="text-xs text-muted-foreground">Across {budgets.length} budgets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of total budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(Math.abs(totalRemaining))}
          </div>
          <p className="text-xs text-muted-foreground">{totalRemaining >= 0 ? "Available to spend" : "Over budget"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onTrackCount}</div>
          <p className="text-xs text-muted-foreground">On track • {overBudgetCount} over budget</p>
        </CardContent>
      </Card>
    </div>
  )
}
