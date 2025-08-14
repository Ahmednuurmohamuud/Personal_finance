"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertCircle } from "lucide-react"

interface Bill {
  id: string
  name: string
  amount: number
  nextDue: string
  type: "income" | "expense"
}

interface UpcomingBillsProps {
  bills: Bill[]
}

export function UpcomingBills({ bills }: UpcomingBillsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date()
    const dueDate = new Date(dateString)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Bills
        </CardTitle>
        <CardDescription>Bills due in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.slice(0, 5).map((bill) => {
            const daysUntil = getDaysUntilDue(bill.nextDue)
            const isOverdue = daysUntil < 0
            const isDueSoon = daysUntil <= 3 && daysUntil >= 0

            return (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {(isOverdue || isDueSoon) && (
                    <AlertCircle className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-yellow-500"}`} />
                  )}
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">Due {formatDate(bill.nextDue)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${bill.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                    {bill.type === "expense" ? "-" : "+"}
                    {formatCurrency(bill.amount)}
                  </p>
                  <Badge variant={isOverdue ? "destructive" : isDueSoon ? "secondary" : "outline"}>
                    {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : `${daysUntil} days`}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
