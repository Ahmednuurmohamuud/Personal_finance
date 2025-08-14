"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Budget } from "@/lib/mock-data"

interface AddEditBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (budget: Omit<Budget, "id"> | Budget) => void
  budget?: Budget | null
  isLoading?: boolean
}

export function AddEditBudgetModal({ isOpen, onClose, onSave, budget, isLoading = false }: AddEditBudgetModalProps) {
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [month, setMonth] = useState("")
  const [rollover, setRollover] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const isEditing = !!budget

  useEffect(() => {
    if (budget) {
      setCategory(budget.category)
      setAmount(budget.amount.toString())
      setMonth(budget.month)
      setRollover(budget.rollover)
      const [year, monthNum] = budget.month.split("-")
      setSelectedDate(new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1))
    } else {
      // Reset form for new budget
      setCategory("")
      setAmount("")
      setMonth("")
      setRollover(false)
      setSelectedDate(new Date())
    }
  }, [budget])

  useEffect(() => {
    if (selectedDate) {
      const monthString = format(selectedDate, "yyyy-MM")
      setMonth(monthString)
    }
  }, [selectedDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !amount || !month) {
      return
    }

    const budgetData = {
      ...(isEditing && { id: budget.id }),
      category,
      amount: Number.parseFloat(amount),
      spent: isEditing ? budget.spent : 0,
      month,
      rollover,
    }

    onSave(budgetData)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Budget" : "Create New Budget"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the budget details below." : "Set up a new budget to track your spending."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food & Dining</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Month & Year</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMMM yyyy") : <span>Pick a month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    defaultMonth={selectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="rollover" checked={rollover} onCheckedChange={setRollover} />
              <Label htmlFor="rollover">Enable rollover</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, unused budget from this month will be added to next month's budget.
            </p>
          </div>

          {isEditing && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Current spending:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(budget.spent)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Budget"
              ) : (
                "Create Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
