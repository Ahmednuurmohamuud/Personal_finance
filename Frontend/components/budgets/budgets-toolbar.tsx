"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, Filter } from "lucide-react"

interface BudgetsToolbarProps {
  onAddBudget: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
  monthFilter: string
  onMonthFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export function BudgetsToolbar({
  onAddBudget,
  searchQuery,
  onSearchChange,
  monthFilter,
  onMonthFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
}: BudgetsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={monthFilter} onValueChange={onMonthFilterChange}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            <SelectItem value="2024-01">January 2024</SelectItem>
            <SelectItem value="2024-02">February 2024</SelectItem>
            <SelectItem value="2024-03">March 2024</SelectItem>
            <SelectItem value="2024-04">April 2024</SelectItem>
            <SelectItem value="2024-05">May 2024</SelectItem>
            <SelectItem value="2024-06">June 2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Food">Food & Dining</SelectItem>
            <SelectItem value="Transportation">Transportation</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Housing">Housing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="near-limit">Near Limit</SelectItem>
            <SelectItem value="over-budget">Over Budget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAddBudget}>
        <Plus className="mr-2 h-4 w-4" />
        Add Budget
      </Button>
    </div>
  )
}
