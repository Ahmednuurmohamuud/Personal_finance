"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionToolbar } from "@/components/transactions/transaction-toolbar"
import { AddEditTransactionModal } from "@/components/transactions/add-edit-transaction-modal"
import { SplitTransactionModal } from "@/components/transactions/split-transaction-modal"
import { TransactionDetailsModal } from "@/components/transactions/transaction-details-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { mockTransactions, type Transaction } from "@/lib/mock-data"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState("30d")
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || transaction.type === typeFilter
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter

      // Simple date filtering (in real app, would be more sophisticated)
      const matchesDate = true // For now, show all dates

      return matchesSearch && matchesType && matchesCategory && matchesDate
    })
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange])

  const handleAddTransaction = () => {
    setSelectedTransaction(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsAddEditModalOpen(true)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
    toast({
      title: "Transaction deleted",
      description: "The transaction has been successfully deleted.",
    })
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsModalOpen(true)
  }

  const handleSplitTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsSplitModalOpen(true)
  }

  const handleSaveTransaction = async (transactionData: Omit<Transaction, "id"> | Transaction) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if ("id" in transactionData) {
      // Edit existing transaction
      setTransactions(transactions.map((t) => (t.id === transactionData.id ? transactionData : t)))
      toast({
        title: "Transaction updated",
        description: "The transaction has been successfully updated.",
      })
    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      }
      setTransactions([newTransaction, ...transactions])
      toast({
        title: "Transaction added",
        description: "The transaction has been successfully added.",
      })
    }

    setIsLoading(false)
    setIsAddEditModalOpen(false)
  }

  const handleSaveSplits = async (splits: any[]) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would create multiple transactions from splits
    toast({
      title: "Transaction split",
      description: `Transaction has been split into ${splits.length} parts.`,
    })

    setIsLoading(false)
    setIsSplitModalOpen(false)
  }

  const handleExport = (format: string) => {
    toast({
      title: "Export started",
      description: `Exporting transactions as ${format.toUpperCase()}...`,
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Transactions</h1>
          </div>

          <TransactionToolbar
            onAddTransaction={handleAddTransaction}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onExport={handleExport}
          />

          <TransactionTable
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onViewDetails={handleViewDetails}
            onSplit={handleSplitTransaction}
          />

          <AddEditTransactionModal
            isOpen={isAddEditModalOpen}
            onClose={() => setIsAddEditModalOpen(false)}
            onSave={handleSaveTransaction}
            transaction={selectedTransaction}
            isLoading={isLoading}
          />

          <SplitTransactionModal
            isOpen={isSplitModalOpen}
            onClose={() => setIsSplitModalOpen(false)}
            onSave={handleSaveSplits}
            transaction={selectedTransaction}
            isLoading={isLoading}
          />

          <TransactionDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            transaction={selectedTransaction}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
