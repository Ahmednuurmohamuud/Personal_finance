"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Globe, Activity } from "lucide-react"
import type { Account } from "@/lib/mock-data"

interface AccountDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  account?: Account | null
}

export function AccountDetailsModal({ isOpen, onClose, account }: AccountDetailsModalProps) {
  if (!account) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account.currency,
    }).format(Math.abs(amount))
  }

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Checking: "bg-blue-100 text-blue-800",
      Savings: "bg-green-100 text-green-800",
      Credit: "bg-red-100 text-red-800",
      Investment: "bg-purple-100 text-purple-800",
      Cash: "bg-yellow-100 text-yellow-800",
      Loan: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getAccountDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      Checking: "Primary account for daily transactions and bill payments",
      Savings: "Interest-bearing account for saving money",
      Credit: "Credit line for purchases with monthly payments",
      Investment: "Account for stocks, bonds, and other investments",
      Cash: "Physical cash on hand",
      Loan: "Borrowed money that needs to be repaid",
    }
    return descriptions[type] || "Financial account"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{account.name}</DialogTitle>
          <DialogDescription>Complete information about this account</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {account.balance < 0 && account.type === "Credit" ? "-" : ""}
              {formatCurrency(account.balance)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Current Balance</p>
          </div>

          <Separator />

          {/* Account Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Account Type</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getAccountTypeColor(account.type)}>
                    {account.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{getAccountDescription(account.type)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">{account.currency}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Status</p>
                <Badge variant={account.status === "active" ? "default" : "secondary"}>
                  {account.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Statistics */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-xs text-muted-foreground">Transactions This Month</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">$2,340</p>
              <p className="text-xs text-muted-foreground">Monthly Activity</p>
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground">
            <p>Account ID: {account.id}</p>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
