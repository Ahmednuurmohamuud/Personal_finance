"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RotateCcw, Trash2 } from "lucide-react"
import type { ArchivedItem } from "@/lib/mock-data"

interface ArchiveTableProps {
  items: ArchivedItem[]
  onRestore: (item: ArchivedItem) => void
  onPermanentDelete: (item: ArchivedItem) => void
}

export function ArchiveTable({ items, onRestore, onPermanentDelete }: ArchiveTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      account: "bg-blue-100 text-blue-800",
      budget: "bg-green-100 text-green-800",
      transaction: "bg-purple-100 text-purple-800",
      bill: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getArchivedByColor = (archivedBy: string) => {
    return archivedBy === "system" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Archived Date</TableHead>
            <TableHead>Archived By</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No archived items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="secondary" className={getTypeColor(item.type)}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{formatDate(item.archivedDate)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getArchivedByColor(item.archivedBy)}>
                    {item.archivedBy === "system" ? "System" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(item)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPermanentDelete(item)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
