"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { BillsTable } from "@/components/bills/bills-table"
import { BillsToolbar } from "@/components/bills/bills-toolbar"
import { AddEditBillModal } from "@/components/bills/add-edit-bill-modal"
import { mockRecurringBills, type RecurringBill } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function BillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>(mockRecurringBills)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null)
  const { toast } = useToast()

  const billsSummary = useMemo(() => {
    const activeBills = bills.filter((bill) => bill.active)
    const totalIncome = activeBills.filter((bill) => bill.type === "income").reduce((sum, bill) => sum + bill.amount, 0)
    const totalExpenses = activeBills
      .filter((bill) => bill.type === "expense")
      .reduce((sum, bill) => sum + Math.abs(bill.amount), 0)

    const today = new Date()
    const overdueBills = activeBills.filter((bill) => {
      const dueDate = new Date(bill.nextDue)
      return dueDate < today
    }).length

    const dueSoonBills = activeBills.filter((bill) => {
      const dueDate = new Date(bill.nextDue)
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    }).length

    return {
      totalBills: activeBills.length,
      totalIncome,
      totalExpenses,
      overdueBills,
      dueSoonBills,
    }
  }, [bills])

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || bill.type === typeFilter

      let matchesStatus = true
      if (statusFilter !== "all") {
        const today = new Date()
        const dueDate = new Date(bill.nextDue)
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (statusFilter) {
          case "active":
            matchesStatus = bill.active
            break
          case "inactive":
            matchesStatus = !bill.active
            break
          case "overdue":
            matchesStatus = bill.active && diffDays < 0
            break
          case "due-soon":
            matchesStatus = bill.active && diffDays >= 0 && diffDays <= 7
            break
        }
      }

      return matchesSearch && matchesType && matchesStatus
    })
  }, [bills, searchQuery, typeFilter, statusFilter])

  const handleAddBill = () => {
    setEditingBill(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditBill = (bill: RecurringBill) => {
    setEditingBill(bill)
    setIsAddEditModalOpen(true)
  }

  const handleSaveBill = (billData: Partial<RecurringBill>) => {
    if (editingBill) {
      setBills((prev) => prev.map((bill) => (bill.id === editingBill.id ? { ...bill, ...billData } : bill)))
      toast({
        title: "Bill updated",
        description: "The bill has been successfully updated.",
      })
    } else {
      const newBill: RecurringBill = {
        id: Date.now().toString(),
        ...(billData as RecurringBill),
      }
      setBills((prev) => [...prev, newBill])
      toast({
        title: "Bill created",
        description: "The new bill has been successfully created.",
      })
    }
  }

  const handleArchiveBill = (billId: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== billId))
    toast({
      title: "Bill archived",
      description: "The bill has been moved to the archive.",
    })
  }

  const handleMarkPaid = (billId: string) => {
    const bill = bills.find((b) => b.id === billId)
    if (bill) {
      // Calculate next due date based on frequency
      const currentDue = new Date(bill.nextDue)
      const nextDue = new Date(currentDue)

      switch (bill.frequency) {
        case "Weekly":
          nextDue.setDate(currentDue.getDate() + 7)
          break
        case "Bi-weekly":
          nextDue.setDate(currentDue.getDate() + 14)
          break
        case "Monthly":
          nextDue.setMonth(currentDue.getMonth() + 1)
          break
        case "Quarterly":
          nextDue.setMonth(currentDue.getMonth() + 3)
          break
        case "Yearly":
          nextDue.setFullYear(currentDue.getFullYear() + 1)
          break
      }

      setBills((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, nextDue: nextDue.toISOString().split("T")[0] } : b)),
      )

      toast({
        title: "Bill marked as paid",
        description: `Next due date updated to ${nextDue.toLocaleDateString()}.`,
      })
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Amount", "Type", "Frequency", "Next Due", "Status"],
      ...filteredBills.map((bill) => [
        bill.name,
        bill.amount.toString(),
        bill.type,
        bill.frequency,
        bill.nextDue,
        bill.active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bills.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: "Bills data has been exported to CSV.",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bills Management</h1>
        <p className="text-muted-foreground">Manage your recurring bills and income sources</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billsSummary.totalBills}</div>
            <p className="text-xs text-muted-foreground">Active recurring bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${billsSummary.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From recurring sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${billsSummary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From recurring bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{billsSummary.overdueBills}</div>
            <p className="text-xs text-muted-foreground">Bills past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{billsSummary.dueSoonBills}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <BillsToolbar
        onAddBill={handleAddBill}
        onSearch={setSearchQuery}
        onFilterType={setTypeFilter}
        onFilterStatus={setStatusFilter}
        onExport={handleExport}
      />

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills ({filteredBills.length})</CardTitle>
          <CardDescription>Manage your recurring bills and income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <BillsTable
            bills={filteredBills}
            onEdit={handleEditBill}
            onArchive={handleArchiveBill}
            onMarkPaid={handleMarkPaid}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <AddEditBillModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveBill}
        bill={editingBill}
      />
    </div>
  )
}
