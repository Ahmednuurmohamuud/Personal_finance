"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react"
import type { Account } from "@/lib/mock-data"

interface AccountsSummaryProps {
  accounts: Account[]
}

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const activeAccounts = accounts.filter((account) => account.status === "active")
  const totalAssets = accounts
    .filter((account) => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0)
  const totalLiabilities = Math.abs(
    accounts.filter((account) => account.balance < 0).reduce((sum, account) => sum + account.balance, 0),
  )
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAccounts.length}</div>
          <p className="text-xs text-muted-foreground">Active accounts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets)}</div>
          <p className="text-xs text-muted-foreground">Positive balances</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</div>
          <p className="text-xs text-muted-foreground">Debts and credit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(netWorth)}
          </div>
          <p className="text-xs text-muted-foreground">Assets minus liabilities</p>
        </CardContent>
      </Card>
    </div>
  )
}
