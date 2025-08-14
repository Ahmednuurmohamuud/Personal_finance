"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { Account } from "@/lib/mock-data"

interface AddEditAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: Omit<Account, "id"> | Account) => void
  account?: Account | null
  isLoading?: boolean
}

export function AddEditAccountModal({ isOpen, onClose, onSave, account, isLoading = false }: AddEditAccountModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [balance, setBalance] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [isActive, setIsActive] = useState(true)

  const isEditing = !!account

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setBalance(account.balance.toString())
      setCurrency(account.currency)
      setIsActive(account.status === "active")
    } else {
      // Reset form for new account
      setName("")
      setType("")
      setBalance("")
      setCurrency("USD")
      setIsActive(true)
    }
  }, [account])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !type || !balance) {
      return
    }

    const accountData = {
      ...(isEditing && { id: account.id }),
      name,
      type,
      balance: Number.parseFloat(balance),
      currency,
      status: isActive ? ("active" as const) : ("inactive" as const),
    }

    onSave(accountData)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Account" : "Add New Account"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the account details below." : "Enter the details for your new account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="Enter account name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking Account</SelectItem>
                  <SelectItem value="Savings">Savings Account</SelectItem>
                  <SelectItem value="Credit">Credit Card</SelectItem>
                  <SelectItem value="Investment">Investment Account</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">{isEditing ? "Current Balance" : "Initial Balance"}</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {type === "Credit" || type === "Loan"
                ? "Enter negative amount for debt (e.g., -1000 for $1,000 owed)"
                : "Enter the current balance for this account"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active">Account is active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Update Account"
              ) : (
                "Add Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
