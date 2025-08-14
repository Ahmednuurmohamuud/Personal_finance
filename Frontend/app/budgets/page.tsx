"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { BudgetCard } from "@/components/budgets/budget-card"
import { BudgetsToolbar } from "@/components/budgets/budgets-toolbar"
import { BudgetsSummary } from "@/components/budgets/budgets-summary"
import { BudgetOverviewChart } from "@/components/budgets/budget-overview-chart"
import { AddEditBudgetModal } from "@/components/budgets/add-edit-budget-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { mockBudgets, type Budget } from "@/lib/mock-data"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets)
  const [searchQuery, setSearchQuery] = useState("")
  const [monthFilter, setMonthFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  // Filter budgets based on search and filters
  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const matchesSearch = budget.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMonth = monthFilter === "all" || budget.month === monthFilter
      const matchesCategory = categoryFilter === "all" || budget.category === categoryFilter

      let matchesStatus = true
      if (statusFilter !== "all") {
        const percentage = (budget.spent / budget.amount) * 100
        switch (statusFilter) {
          case "on-track":
            matchesStatus = percentage <= 80
            break
          case "near-limit":
            matchesStatus = percentage > 80 && percentage <= 100
            break
          case "over-budget":
            matchesStatus = percentage > 100
            break
        }
      }

      return matchesSearch && matchesMonth && matchesCategory && matchesStatus
    })
  }, [budgets, searchQuery, monthFilter, categoryFilter, statusFilter])

  const handleAddBudget = () => {
    setSelectedBudget(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsAddEditModalOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    const budget = budgets.find((b) => b.id === id)
    if (budget) {
      setBudgets(budgets.filter((b) => b.id !== id))
      toast({
        title: "Budget deleted",
        description: `${budget.category} budget has been deleted successfully.`,
      })
    }
  }

  const handleSaveBudget = async (budgetData: Omit<Budget, "id"> | Budget) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if ("id" in budgetData) {
      // Edit existing budget
      setBudgets(budgets.map((b) => (b.id === budgetData.id ? budgetData : b)))
      toast({
        title: "Budget updated",
        description: "The budget has been successfully updated.",
      })
    } else {
      // Add new budget
      const newBudget: Budget = {
        ...budgetData,
        id: Date.now().toString(),
      }
      setBudgets([...budgets, newBudget])
      toast({
        title: "Budget created",
        description: "The budget has been successfully created.",
      })
    }

    setIsLoading(false)
    setIsAddEditModalOpen(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Budgets</h1>
          </div>

          <BudgetsSummary budgets={budgets} />

          <BudgetsToolbar
            onAddBudget={handleAddBudget}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <BudgetOverviewChart budgets={filteredBudgets} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={handleEditBudget} onDelete={handleDeleteBudget} />
            ))}
          </div>

          {filteredBudgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No budgets found matching your criteria.</p>
              <button type="button" onClick={handleAddBudget} className="mt-4 text-primary hover:underline">
                Create your first budget
              </button>
            </div>
          )}

          <AddEditBudgetModal
            isOpen={isAddEditModalOpen}
            onClose={() => setIsAddEditModalOpen(false)}
            onSave={handleSaveBudget}
            budget={selectedBudget}
            isLoading={isLoading}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
