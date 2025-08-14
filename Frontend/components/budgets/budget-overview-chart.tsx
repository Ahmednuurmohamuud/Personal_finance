"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Budget } from "@/lib/mock-data"

interface BudgetOverviewChartProps {
  budgets: Budget[]
}

export function BudgetOverviewChart({ budgets }: BudgetOverviewChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const chartData = budgets.map((budget) => ({
    category: budget.category,
    budgeted: budget.amount,
    spent: budget.spent,
    remaining: Math.max(0, budget.amount - budget.spent),
  }))

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Budgeted vs actual spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
            <Bar dataKey="spent" fill="#ef4444" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
