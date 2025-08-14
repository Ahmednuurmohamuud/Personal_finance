"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  rollover: boolean
}

interface BudgetProgressProps {
  budgets: Budget[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Your spending vs budget for this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100
            const remaining = budget.amount - budget.spent
            const isOverBudget = percentage > 100

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{budget.category}</span>
                    {budget.rollover && <Badge variant="outline">Rollover</Badge>}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
                />
                <div className="flex justify-between text-sm">
                  <span className={isOverBudget ? "text-red-600" : "text-muted-foreground"}>
                    {percentage.toFixed(1)}% used
                  </span>
                  <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                    {isOverBudget ? "Over by " : "Remaining: "}
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
