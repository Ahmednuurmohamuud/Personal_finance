"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, DollarSign, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface FinancialEvent {
  id: string
  date: string
  title: string
  amount: number
  type: "income" | "expense"
  category: string
}

interface CalendarSidebarProps {
  selectedDate: Date | undefined
  events: FinancialEvent[]
  onEditEvent: (event: FinancialEvent) => void
  onDeleteEvent: (event: FinancialEvent) => void
}

export function CalendarSidebar({ selectedDate, events, onEditEvent, onDeleteEvent }: CalendarSidebarProps) {
  const selectedDateEvents = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const getTotalIncome = () => {
    return selectedDateEvents.filter((event) => event.type === "income").reduce((sum, event) => sum + event.amount, 0)
  }

  const getTotalExpenses = () => {
    return selectedDateEvents
      .filter((event) => event.type === "expense")
      .reduce((sum, event) => sum + Math.abs(event.amount), 0)
  }

  if (!selectedDate) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Bill Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Select a date to view bill details</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bills or events on this date</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Income</div>
                  <div className="text-lg font-semibold text-green-600">{formatCurrency(getTotalIncome())}</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Expenses</div>
                  <div className="text-lg font-semibold text-red-600">{formatCurrency(getTotalExpenses())}</div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge
                          variant="secondary"
                          className={
                            event.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {event.category}
                        </Badge>
                      </div>
                      <div className={`font-semibold ${event.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {event.type === "income" ? "+" : "-"}
                        {formatCurrency(event.amount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEvent(event)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Income</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  events
                    .filter(
                      (event) =>
                        event.type === "income" &&
                        new Date(event.date).getMonth() === selectedDate.getMonth() &&
                        new Date(event.date).getFullYear() === selectedDate.getFullYear(),
                    )
                    .reduce((sum, event) => sum + event.amount, 0),
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(
                  events
                    .filter(
                      (event) =>
                        event.type === "expense" &&
                        new Date(event.date).getMonth() === selectedDate.getMonth() &&
                        new Date(event.date).getFullYear() === selectedDate.getFullYear(),
                    )
                    .reduce((sum, event) => sum + Math.abs(event.amount), 0),
                )}
              </span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Net Income</span>
              <span className={getTotalIncome() - getTotalExpenses() >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(getTotalIncome() - getTotalExpenses())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
