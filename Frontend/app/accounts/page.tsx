"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountsToolbar } from "@/components/accounts/accounts-toolbar"
import { AccountsSummary } from "@/components/accounts/accounts-summary"
import { AddEditAccountModal } from "@/components/accounts/add-edit-account-modal"
import { AccountDetailsModal } from "@/components/accounts/account-details-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { mockAccounts, type Account } from "@/lib/mock-data"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.type.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || account.type === typeFilter
      const matchesStatus = statusFilter === "all" || account.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [accounts, searchQuery, typeFilter, statusFilter])

  const handleAddAccount = () => {
    setSelectedAccount(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsAddEditModalOpen(true)
  }

  const handleArchiveAccount = (id: string) => {
    const account = accounts.find((a) => a.id === id)
    if (account) {
      setAccounts(accounts.map((a) => (a.id === id ? { ...a, status: "inactive" as const } : a)))
      toast({
        title: "Account archived",
        description: `${account.name} has been archived successfully.`,
      })
    }
  }

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account)
    setIsDetailsModalOpen(true)
  }

  const handleSaveAccount = async (accountData: Omit<Account, "id"> | Account) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if ("id" in accountData) {
      // Edit existing account
      setAccounts(accounts.map((a) => (a.id === accountData.id ? accountData : a)))
      toast({
        title: "Account updated",
        description: "The account has been successfully updated.",
      })
    } else {
      // Add new account
      const newAccount: Account = {
        ...accountData,
        id: Date.now().toString(),
      }
      setAccounts([...accounts, newAccount])
      toast({
        title: "Account added",
        description: "The account has been successfully added.",
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
            <h1 className="text-3xl font-bold">Accounts</h1>
          </div>

          <AccountsSummary accounts={accounts} />

          <AccountsToolbar
            onAddAccount={handleAddAccount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEditAccount}
                onArchive={handleArchiveAccount}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No accounts found matching your criteria.</p>
              <button type="button" onClick={handleAddAccount} className="mt-4 text-primary hover:underline">
                Add your first account
              </button>
            </div>
          )}

          <AddEditAccountModal
            isOpen={isAddEditModalOpen}
            onClose={() => setIsAddEditModalOpen(false)}
            onSave={handleSaveAccount}
            account={selectedAccount}
            isLoading={isLoading}
          />

          <AccountDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            account={selectedAccount}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
