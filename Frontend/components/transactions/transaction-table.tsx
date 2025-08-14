"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Split } from "lucide-react"
import type { Transaction } from "@/lib/mock-data"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onViewDetails: (transaction: Transaction) => void
  onSplit: (transaction: Transaction) => void
}

export function TransactionTable({ transactions, onEdit, onDelete, onViewDetails, onSplit }: TransactionTableProps) {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Income: "bg-green-100 text-green-800",
      Food: "bg-orange-100 text-orange-800",
      Transportation: "bg-blue-100 text-blue-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Utilities: "bg-yellow-100 text-yellow-800",
      Shopping: "bg-pink-100 text-pink-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow
              key={transaction.id}
              className={`fade-scale-in transition-all duration-300 hover:bg-accent/50 ${
                index < 5 ? `animate-stagger-${index + 1}` : ""
              }`}
            >
              <TableCell className="font-medium transition-colors duration-300">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell className="transition-colors duration-300">{transaction.description}</TableCell>
              <TableCell>
                <span
                  className={`transition-all duration-300 ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${getCategoryColor(transaction.category)} transition-all duration-300 hover:scale-105`}
                >
                  {transaction.category}
                </Badge>
              </TableCell>
              <TableCell className="transition-colors duration-300">{transaction.account}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-accent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="scale-in">
                    <DropdownMenuItem
                      onClick={() => onViewDetails(transaction)}
                      className="transition-colors duration-200"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(transaction)} className="transition-colors duration-200">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSplit(transaction)} className="transition-colors duration-200">
                      <Split className="mr-2 h-4 w-4" />
                      Split Transaction
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
