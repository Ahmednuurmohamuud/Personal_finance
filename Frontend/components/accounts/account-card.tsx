"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Archive, Eye, TrendingUp, TrendingDown } from "lucide-react"
import type { Account } from "@/lib/mock-data"

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onArchive: (id: string) => void
  onViewDetails: (account: Account) => void
}

export function AccountCard({ account, onEdit, onArchive, onViewDetails }: AccountCardProps) {
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
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Investment":
        return account.balance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Card className="hover-lift group transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="transition-transform duration-300 group-hover:scale-110">{getAccountIcon(account.type)}</div>
          <div>
            <h3 className="font-semibold transition-colors duration-300 group-hover:text-primary">{account.name}</h3>
            <Badge variant="secondary" className={`${getAccountTypeColor(account.type)} transition-all duration-300`}>
              {account.type}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-accent">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="scale-in">
            <DropdownMenuItem onClick={() => onViewDetails(account)} className="transition-colors duration-200">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(account)} className="transition-colors duration-200">
              <Edit className="mr-2 h-4 w-4" />
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onArchive(account.id)}
              className="text-orange-600 transition-colors duration-200"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span
              className={`text-lg font-bold transition-all duration-300 ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {account.balance < 0 && account.type === "Credit" ? "-" : ""}
              {formatCurrency(account.balance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant={account.status === "active" ? "default" : "secondary"}
              className="transition-all duration-300"
            >
              {account.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">
              {account.currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
