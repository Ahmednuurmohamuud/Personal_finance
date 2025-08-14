"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { Transaction } from "@/lib/mock-data"

interface Split {
  id: string
  description: string
  amount: number
  category: string
}

interface SplitTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (splits: Split[]) => void
  transaction?: Transaction | null
  isLoading?: boolean
}

export function SplitTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  isLoading = false,
}: SplitTransactionModalProps) {
  const [splits, setSplits] = useState<Split[]>([])

  useEffect(() => {
    if (transaction) {
      // Initialize with the original transaction as first split
      setSplits([
        {
          id: "1",
          description: transaction.description,
          amount: Math.abs(transaction.amount),
          category: transaction.category,
        },
      ])
    }
  }, [transaction])

  const addSplit = () => {
    const newSplit: Split = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
      category: "",
    }
    setSplits([...splits, newSplit])
  }

  const removeSplit = (id: string) => {
    if (splits.length > 1) {
      setSplits(splits.filter((split) => split.id !== id))
    }
  }

  const updateSplit = (id: string, field: keyof Split, value: string | number) => {
    setSplits(
      splits.map((split) =>
        split.id === id
          ? {
              ...split,
              [field]: field === "amount" ? Number.parseFloat(value.toString()) || 0 : value,
            }
          : split,
      ),
    )
  }

  const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0)
  const originalAmount = transaction ? Math.abs(transaction.amount) : 0
  const difference = totalSplitAmount - originalAmount

  const handleSave = () => {
    if (
      Math.abs(difference) < 0.01 &&
      splits.every((split) => split.description && split.category && split.amount > 0)
    ) {
      onSave(splits)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
          <DialogDescription>
            Break down this transaction into multiple categories. The total must equal the original amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Transaction Info */}
          {transaction && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <p className="font-bold">{formatCurrency(Math.abs(transaction.amount))}</p>
              </div>
            </div>
          )}

          {/* Splits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Transaction Splits</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSplit}>
                <Plus className="mr-2 h-4 w-4" />
                Add Split
              </Button>
            </div>

            {splits.map((split, index) => (
              <div key={split.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                <div className="col-span-4">
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="Split description"
                    value={split.description}
                    onChange={(e) => updateSplit(split.id, "description", e.target.value)}
                    className="h-8"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={split.amount || ""}
                    onChange={(e) => updateSplit(split.id, "amount", e.target.value)}
                    className="h-8"
                  />
                </div>

                <div className="col-span-4">
                  <Label className="text-xs">Category</Label>
                  <Select value={split.category} onValueChange={(value) => updateSplit(split.id, "category", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food & Dining</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSplit(split.id)}
                    disabled={splits.length === 1}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Total Splits:</span>
              <span className="font-medium">{formatCurrency(totalSplitAmount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Original Amount:</span>
              <span className="font-medium">{formatCurrency(originalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Difference:</span>
              <Badge variant={Math.abs(difference) < 0.01 ? "default" : "destructive"}>
                {formatCurrency(difference)}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isLoading ||
              Math.abs(difference) >= 0.01 ||
              !splits.every((split) => split.description && split.category && split.amount > 0)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Splits"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
