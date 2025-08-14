"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResultItem } from "@/components/search/search-result-item"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchPagination } from "@/components/search/search-pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileX } from "lucide-react"
import {
  mockTransactions,
  mockAccounts,
  mockBudgets,
  mockRecurringBills,
  type SearchResult,
  type Transaction,
  type Account,
  type Budget,
  type RecurringBill,
} from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const { toast } = useToast()

  // Convert data to unified search results
  const allResults: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = []

    // Add transactions
    mockTransactions.forEach((transaction: Transaction) => {
      results.push({
        id: `transaction-${transaction.id}`,
        type: "transaction",
        title: transaction.description,
        subtitle: `${transaction.account} • ${transaction.type}`,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        data: transaction,
      })
    })

    // Add accounts
    mockAccounts.forEach((account: Account) => {
      results.push({
        id: `account-${account.id}`,
        type: "account",
        title: account.name,
        subtitle: `${account.type} Account`,
        amount: account.balance,
        category: account.type,
        status: account.status,
        data: account,
      })
    })

    // Add budgets
    mockBudgets.forEach((budget: Budget) => {
      const percentage = (budget.spent / budget.amount) * 100
      results.push({
        id: `budget-${budget.id}`,
        type: "budget",
        title: `${budget.category} Budget`,
        subtitle: `${percentage.toFixed(0)}% used • ${budget.month}`,
        amount: budget.amount,
        category: budget.category,
        status: percentage > 90 ? "overdue" : percentage > 75 ? "upcoming" : "active",
        data: budget,
      })
    })

    // Add recurring bills
    mockRecurringBills.forEach((bill: RecurringBill) => {
      results.push({
        id: `bill-${bill.id}`,
        type: "bill",
        title: bill.name,
        subtitle: `${bill.frequency} • Next due: ${new Date(bill.nextDue).toLocaleDateString()}`,
        amount: bill.amount,
        date: bill.nextDue,
        status: bill.active ? "active" : "inactive",
        data: bill,
      })
    })

    return results
  }, [])

  // Filter and search results
  const filteredResults = useMemo(() => {
    return allResults.filter((result) => {
      // Text search
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        result.title.toLowerCase().includes(searchLower) ||
        result.subtitle.toLowerCase().includes(searchLower) ||
        result.category?.toLowerCase().includes(searchLower)

      // Type filter
      const matchesType = typeFilter === "all" || result.type === typeFilter

      // Category filter
      const matchesCategory = categoryFilter === "all" || result.category === categoryFilter

      // Date filter
      const resultDate = result.date ? new Date(result.date) : null
      const matchesDateFrom = !dateFrom || !resultDate || resultDate >= dateFrom
      const matchesDateTo = !dateTo || !resultDate || resultDate <= dateTo

      // Amount filter
      const resultAmount = result.amount || 0
      const matchesAmountMin = !amountMin || resultAmount >= Number.parseFloat(amountMin)
      const matchesAmountMax = !amountMax || resultAmount <= Number.parseFloat(amountMax)

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesAmountMin &&
        matchesAmountMax
      )
    })
  }, [allResults, searchQuery, typeFilter, categoryFilter, dateFrom, dateTo, amountMin, amountMax])

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, categoryFilter, dateFrom, dateTo, amountMin, amountMax])

  const handleClearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    setAmountMin("")
    setAmountMax("")
  }

  const handleView = (result: SearchResult) => {
    toast({
      title: "View Item",
      description: `Viewing ${result.title}`,
    })
  }

  const handleEdit = (result: SearchResult) => {
    toast({
      title: "Edit Item",
      description: `Editing ${result.title}`,
    })
  }

  const handleDelete = (result: SearchResult) => {
    toast({
      title: "Delete Item",
      description: `Deleting ${result.title}`,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Search Results</h1>
          <p className="text-muted-foreground mt-2">
            Search across all your financial data including transactions, accounts, budgets, and bills.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions, accounts, budgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <SearchFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          amountMin={amountMin}
          onAmountMinChange={setAmountMin}
          amountMax={amountMax}
          onAmountMaxChange={setAmountMax}
          onClearFilters={handleClearFilters}
        />

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
            </h2>
            {searchQuery && (
              <div className="text-sm text-muted-foreground">
                Searching for: <span className="font-medium">"{searchQuery}"</span>
              </div>
            )}
          </div>

          {paginatedResults.length === 0 ? (
            <div className="text-center py-12">
              <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {filteredResults.length > 0 && (
          <SearchPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredResults.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>
    </div>
  )
}
