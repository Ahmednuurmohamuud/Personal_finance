"use client"

import { useState } from "react"
import { FinancialCalendar } from "@/components/calendar/financial-calendar"
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar"
import { CalendarFilters } from "@/components/calendar/calendar-filters"
import { mockRecurringBills, type RecurringBill } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { addMonths, subMonths } from "date-fns"

interface FinancialEvent {
  id: string
  date: string
  title: string
  amount: number
  type: "income" | "expense"
  category: string
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showIncome, setShowIncome] = useState(true)
  const [showExpenses, setShowExpenses] = useState(true)
  const { toast } = useToast()

  // Convert recurring bills to financial events
  const generateFinancialEvents = (): FinancialEvent[] => {
    const events: FinancialEvent[] = []

    mockRecurringBills.forEach((bill: RecurringBill) => {
      if (!bill.active) return

      // Generate events for the current month and next few months
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0)

      let eventDate = new Date(bill.nextDue)

      while (eventDate <= endDate) {
        if (eventDate >= startDate) {
          events.push({
            id: `${bill.id}-${eventDate.toISOString()}`,
            date: eventDate.toISOString().split("T")[0],
            title: bill.name,
            amount: Math.abs(bill.amount),
            type: bill.type,
            category: bill.type === "income" ? "Income" : "Bills",
          })
        }

        // Add next occurrence based on frequency
        if (bill.frequency === "Monthly") {
          eventDate = addMonths(eventDate, 1)
        } else if (bill.frequency === "Weekly") {
          eventDate = new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        } else if (bill.frequency === "Yearly") {
          eventDate = new Date(eventDate.getFullYear() + 1, eventDate.getMonth(), eventDate.getDate())
        }
      }
    })

    // Add some sample one-time events
    const sampleEvents: FinancialEvent[] = [
      {
        id: "bonus-1",
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15).toISOString().split("T")[0],
        title: "Quarterly Bonus",
        amount: 2000,
        type: "income",
        category: "Bonus",
      },
      {
        id: "maintenance-1",
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 20).toISOString().split("T")[0],
        title: "Car Maintenance",
        amount: 300,
        type: "expense",
        category: "Transportation",
      },
    ]

    return [...events, ...sampleEvents]
  }

  const financialEvents = generateFinancialEvents()

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
    setSelectedDate(undefined)
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
    setSelectedDate(undefined)
  }

  const handleAddEvent = () => {
    toast({
      title: "Add Event",
      description: "Add event functionality would be implemented here.",
    })
  }

  const handleEditEvent = (event: FinancialEvent) => {
    toast({
      title: "Edit Event",
      description: `Editing ${event.title}`,
    })
  }

  const handleDeleteEvent = (event: FinancialEvent) => {
    toast({
      title: "Delete Event",
      description: `Deleting ${event.title}`,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View your upcoming bills, recurring payments, and income events in a monthly calendar view.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CalendarFilters
              showIncome={showIncome}
              onShowIncomeChange={setShowIncome}
              showExpenses={showExpenses}
              onShowExpensesChange={setShowExpenses}
              currentMonth={currentMonth}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onAddEvent={handleAddEvent}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <FinancialCalendar
                events={financialEvents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                showIncome={showIncome}
                showExpenses={showExpenses}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <CalendarSidebar
              selectedDate={selectedDate}
              events={financialEvents}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
