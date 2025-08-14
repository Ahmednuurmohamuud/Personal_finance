"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"

interface StatsCardsProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netWorth: number
}

export function StatsCards({ totalBalance, monthlyIncome, monthlyExpenses, netWorth }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="fade-scale-in animate-stagger-1 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">Across all accounts</p>
        </CardContent>
      </Card>

      <Card className="fade-scale-in animate-stagger-2 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 transition-all duration-300">
            {formatCurrency(monthlyIncome)}
          </div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="fade-scale-in animate-stagger-3 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses This Month</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 transition-all duration-300">
            {formatCurrency(Math.abs(monthlyExpenses))}
          </div>
          <p className="text-xs text-muted-foreground">-8% from last month</p>
        </CardContent>
      </Card>

      <Card className="fade-scale-in animate-stagger-4 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300">{formatCurrency(netWorth)}</div>
          <p className="text-xs text-muted-foreground">+4.2% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
