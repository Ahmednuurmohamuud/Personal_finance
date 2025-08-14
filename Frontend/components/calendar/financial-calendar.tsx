"use client"

import type React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DayButton } from "react-day-picker"

interface FinancialEvent {
  id: string
  date: string
  title: string
  amount: number
  type: "income" | "expense"
  category: string
}

interface FinancialCalendarProps {
  events: FinancialEvent[]
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  showIncome: boolean
  showExpenses: boolean
}

function FinancialDayButton({
  day,
  events,
  showIncome,
  showExpenses,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  events: FinancialEvent[]
  showIncome: boolean
  showExpenses: boolean
}) {
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const isSameDay =
      eventDate.getDate() === day.date.getDate() &&
      eventDate.getMonth() === day.date.getMonth() &&
      eventDate.getFullYear() === day.date.getFullYear()

    if (!isSameDay) return false

    if (event.type === "income" && !showIncome) return false
    if (event.type === "expense" && !showExpenses) return false

    return true
  })

  const incomeEvents = dayEvents.filter((e) => e.type === "income")
  const expenseEvents = dayEvents.filter((e) => e.type === "expense")

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex aspect-square size-auto w-full min-w-8 flex-col gap-1 leading-none font-normal relative",
        dayEvents.length > 0 && "ring-2 ring-blue-200 bg-blue-50/50",
        props.className,
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {dayEvents.length > 0 && (
        <div className="flex gap-1 mt-1">
          {incomeEvents.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-green-500" title={`${incomeEvents.length} income event(s)`} />
          )}
          {expenseEvents.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-red-500" title={`${expenseEvents.length} expense event(s)`} />
          )}
        </div>
      )}
    </Button>
  )
}

export function FinancialCalendar({
  events,
  selectedDate,
  onDateSelect,
  showIncome,
  showExpenses,
}: FinancialCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="w-full"
      components={{
        DayButton: (props) => (
          <FinancialDayButton {...props} events={events} showIncome={showIncome} showExpenses={showExpenses} />
        ),
      }}
    />
  )
}
