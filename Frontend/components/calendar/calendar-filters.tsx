"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Filter, TrendingUp, TrendingDown, Calendar, Plus } from "lucide-react"

interface CalendarFiltersProps {
  showIncome: boolean
  onShowIncomeChange: (show: boolean) => void
  showExpenses: boolean
  onShowExpensesChange: (show: boolean) => void
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onAddEvent: () => void
}

export function CalendarFilters({
  showIncome,
  onShowIncomeChange,
  showExpenses,
  onShowExpensesChange,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onAddEvent,
}: CalendarFiltersProps) {
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onPreviousMonth}>
              Previous
            </Button>
            <span className="font-semibold">{formatMonth(currentMonth)}</span>
            <Button variant="outline" onClick={onNextMonth}>
              Next
            </Button>
          </div>
          <Button onClick={onAddEvent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <Label htmlFor="show-income">Show Income</Label>
            </div>
            <Switch id="show-income" checked={showIncome} onCheckedChange={onShowIncomeChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <Label htmlFor="show-expenses">Show Expenses</Label>
            </div>
            <Switch id="show-expenses" checked={showExpenses} onCheckedChange={onShowExpensesChange} />
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Income events</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Expense events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
