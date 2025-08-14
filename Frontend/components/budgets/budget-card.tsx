"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import type { Budget } from "@/lib/mock-data"

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const percentage = (budget.spent / budget.amount) * 100
  const remaining = budget.amount - budget.spent
  const isOverBudget = percentage > 100
  const isNearLimit = percentage > 80 && percentage <= 100

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (isNearLimit) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = () => {
    if (isOverBudget) return "text-red-600"
    if (isNearLimit) return "text-yellow-600"
    return "text-green-600"
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-800",
      Transportation: "bg-blue-100 text-blue-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Utilities: "bg-yellow-100 text-yellow-800",
      Shopping: "bg-pink-100 text-pink-800",
      Healthcare: "bg-green-100 text-green-800",
      Housing: "bg-indigo-100 text-indigo-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-")
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-lg">{budget.category}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getCategoryColor(budget.category)}>
                {formatMonth(budget.month)}
              </Badge>
              {budget.rollover && (
                <Badge variant="secondary" className="text-xs">
                  Rollover
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(budget)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Budget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(budget.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Budget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent</span>
            <span className={getStatusColor()}>{percentage.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Spent</p>
            <p className="font-semibold">{formatCurrency(budget.spent)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatCurrency(budget.amount)}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{isOverBudget ? "Over budget by:" : "Remaining:"}</span>
            <span className={`font-semibold ${getStatusColor()}`}>{formatCurrency(Math.abs(remaining))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
