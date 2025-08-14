"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RotateCcw, Trash2 } from "lucide-react"

interface ArchiveToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
  archivedByFilter: string
  onArchivedByFilterChange: (archivedBy: string) => void
  selectedCount: number
  onBulkRestore: () => void
  onBulkDelete: () => void
}

export function ArchiveToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  archivedByFilter,
  onArchivedByFilterChange,
  selectedCount,
  onBulkRestore,
  onBulkDelete,
}: ArchiveToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search archived items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="account">Accounts</SelectItem>
              <SelectItem value="budget">Budgets</SelectItem>
              <SelectItem value="transaction">Transactions</SelectItem>
              <SelectItem value="bill">Bills</SelectItem>
            </SelectContent>
          </Select>

          <Select value={archivedByFilter} onValueChange={onArchivedByFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="user">Manual</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Button variant="outline" size="sm" onClick={onBulkRestore}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete All
          </Button>
        </div>
      )}
    </div>
  )
}
