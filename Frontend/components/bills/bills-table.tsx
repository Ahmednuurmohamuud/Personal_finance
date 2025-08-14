"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Archive, CheckCircle } from "lucide-react"
import type { RecurringBill } from "@/lib/mock-data"

interface BillsTableProps {
  bills: RecurringBill[]
  onEdit: (bill: RecurringBill) => void
  onArchive: (billId: string) => void
  onMarkPaid: (billId: string) => void
}

export function BillsTable({ bills, onEdit, onArchive, onMarkPaid }: BillsTableProps) {
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
      year: "numeric",
    })
  }

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date()
    const dueDate = new Date(dateString)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getBillStatus = (bill: RecurringBill) => {
    const daysUntil = getDaysUntilDue(bill.nextDue)
    if (!bill.active) return { label: "Inactive", variant: "secondary" as const }
    if (daysUntil < 0) return { label: "Overdue", variant: "destructive" as const }
    if (daysUntil <= 3) return { label: "Due Soon", variant: "default" as const }
    return { label: "Upcoming", variant: "outline" as const }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => {
            const status = getBillStatus(bill)
            const daysUntil = getDaysUntilDue(bill.nextDue)

            return (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.name}</TableCell>
                <TableCell>
                  <span className={bill.type === "expense" ? "text-red-600" : "text-green-600"}>
                    {bill.type === "expense" ? "-" : "+"}
                    {formatCurrency(bill.amount)}
                  </span>
                </TableCell>
                <TableCell>{bill.frequency}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(bill.nextDue)}</span>
                    {bill.active && daysUntil >= 0 && (
                      <span className="text-xs text-muted-foreground">
                        {daysUntil === 0 ? "Due today" : `${daysUntil} days`}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={bill.type === "income" ? "default" : "secondary"}>
                    {bill.type === "income" ? "Income" : "Expense"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(bill)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {bill.active && daysUntil <= 7 && (
                        <DropdownMenuItem onClick={() => onMarkPaid(bill.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onArchive(bill.id)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
