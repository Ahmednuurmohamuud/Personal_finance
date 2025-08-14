"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit, Trash2 } from "lucide-react"
import type { SearchResult } from "@/lib/mock-data"

interface SearchResultItemProps {
  result: SearchResult
  onView: (result: SearchResult) => void
  onEdit: (result: SearchResult) => void
  onDelete: (result: SearchResult) => void
}

export function SearchResultItem({ result, onView, onEdit, onDelete }: SearchResultItemProps) {
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      transaction: "bg-purple-100 text-purple-800",
      account: "bg-blue-100 text-blue-800",
      budget: "bg-green-100 text-green-800",
      bill: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
      upcoming: "bg-yellow-100 text-yellow-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getTypeColor(result.type)}>
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
              </Badge>
              {result.status && (
                <Badge variant="outline" className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg">{result.title}</h3>
              <p className="text-muted-foreground">{result.subtitle}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {result.amount && (
                <span className={result.amount > 0 ? "text-green-600" : "text-red-600"}>
                  {result.amount > 0 ? "+" : ""}
                  {formatCurrency(result.amount)}
                </span>
              )}
              {result.date && <span>{formatDate(result.date)}</span>}
              {result.category && (
                <Badge variant="outline" className="text-xs">
                  {result.category}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="sm" onClick={() => onView(result)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(result)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(result)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
