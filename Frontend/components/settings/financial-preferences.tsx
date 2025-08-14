"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface FinancialPreferencesProps {
  onSave: (data: { currency: string; monthlyIncome: number; savingsGoal: number }) => void
  isLoading?: boolean
}

export function FinancialPreferences({ onSave, isLoading = false }: FinancialPreferencesProps) {
  const { user } = useAuth()
  const [currency, setCurrency] = useState(user?.preferredCurrency || "USD")
  const [monthlyIncome, setMonthlyIncome] = useState("5000")
  const [savingsGoal, setSavingsGoal] = useState("1000")

  const handleSave = () => {
    onSave({
      currency,
      monthlyIncome: Number.parseFloat(monthlyIncome) || 0,
      savingsGoal: Number.parseFloat(savingsGoal) || 0,
    })
  }

  const formatCurrency = (amount: string) => {
    const num = Number.parseFloat(amount) || 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(num)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Preferences</CardTitle>
        <CardDescription>Set your financial goals and preferred currency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
              <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <Input
              id="monthlyIncome"
              type="number"
              step="0.01"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Current: {formatCurrency(monthlyIncome)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savingsGoal">Monthly Savings Goal</Label>
            <Input
              id="savingsGoal"
              type="number"
              step="0.01"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Target: {formatCurrency(savingsGoal)}</p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Savings Rate Goal</span>
            <span className="text-sm font-bold">
              {monthlyIncome && savingsGoal
                ? `${((Number.parseFloat(savingsGoal) / Number.parseFloat(monthlyIncome)) * 100).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Financial experts recommend saving 20% of your income. You're targeting{" "}
            {monthlyIncome && savingsGoal
              ? `${((Number.parseFloat(savingsGoal) / Number.parseFloat(monthlyIncome)) * 100).toFixed(1)}%`
              : "0%"}
            .
          </p>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
