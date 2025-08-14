"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArchiveTable } from "@/components/archive/archive-table"
import { ArchiveToolbar } from "@/components/archive/archive-toolbar"
import { DeleteConfirmationModal } from "@/components/archive/delete-confirmation-modal"
import { archivedItems, type ArchivedItem } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function ArchivePage() {
  const [items, setItems] = useState<ArchivedItem[]>(archivedItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [archivedByFilter, setArchivedByFilter] = useState("all")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ArchivedItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || item.type === typeFilter
    const matchesArchivedBy = archivedByFilter === "all" || item.archivedBy === archivedByFilter
    return matchesSearch && matchesType && matchesArchivedBy
  })

  const handleRestore = async (item: ArchivedItem) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast({
        title: "Item Restored",
        description: `${item.name} has been restored successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermanentDelete = (item: ArchivedItem) => {
    setItemToDelete(item)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id))
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been permanently deleted.`,
      })
      setDeleteModalOpen(false)
      setItemToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkRestore = async () => {
    // For now, just show a toast - in real app would restore selected items
    toast({
      title: "Bulk Restore",
      description: "Bulk restore functionality would be implemented here.",
    })
  }

  const handleBulkDelete = async () => {
    // For now, just show a toast - in real app would delete selected items
    toast({
      title: "Bulk Delete",
      description: "Bulk delete functionality would be implemented here.",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold">Archive</h1>
          <p className="text-muted-foreground mt-2">
            Manage your archived accounts, budgets, transactions, and bills. You can restore items or permanently delete
            them.
          </p>
        </div>

        <ArchiveToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          archivedByFilter={archivedByFilter}
          onArchivedByFilterChange={setArchivedByFilter}
          selectedCount={0} // Would track selected items in real implementation
          onBulkRestore={handleBulkRestore}
          onBulkDelete={handleBulkDelete}
        />

        <div className="bg-white rounded-lg border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Archived Items</h2>
              <div className="text-sm text-muted-foreground">
                {filteredItems.length} of {items.length} items
              </div>
            </div>

            <ArchiveTable items={filteredItems} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} />
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setItemToDelete(null)
          }}
          onConfirm={confirmDelete}
          item={itemToDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
