"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Plus, Menu, User, Settings, Archive, LogOut, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Accounts", href: "/accounts" },
  { name: "Budgets", href: "/budgets" },
  { name: "Bills", href: "/bills" },
  { name: "Reports", href: "/reports" },
]

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden transition-all duration-200 hover:scale-110 hover:bg-accent/50 border border-border/50"
              >
                <Menu className="h-5 w-5 text-foreground" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 py-4">
                <div className="flex items-center space-x-2 px-4">
                  <DollarSign className="h-6 w-6 text-primary transition-transform duration-300 hover:scale-110" />
                  <span className="text-lg font-bold">Finance Manager</span>
                </div>
                <nav className="flex flex-col space-y-2">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 text-sm rounded-md transition-all duration-300 hover:translate-x-1 ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent hover:text-accent-foreground"
                      } fade-scale-in animate-stagger-${index + 1}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <DollarSign className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-lg font-bold hidden sm:block transition-colors duration-300 group-hover:text-primary">
              Finance Manager
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-all duration-300 relative group ${
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
              <span
                className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                  pathname === item.href ? "w-full" : ""
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Search, Notifications, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-8 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Notifications */}
          <div className="transition-transform duration-200 hover:scale-110">
            <NotificationsDropdown />
          </div>

          {/* Add Button (Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="md:hidden transition-all duration-200 hover:scale-110 hover:rotate-90">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="scale-in">
              <DropdownMenuItem className="transition-colors duration-200">Add Transaction</DropdownMenuItem>
              <DropdownMenuItem className="transition-colors duration-200">Add Account</DropdownMenuItem>
              <DropdownMenuItem className="transition-colors duration-200">Add Budget</DropdownMenuItem>
              <DropdownMenuItem className="transition-colors duration-200">Add Recurring Bill</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Avatar className="h-8 w-8 transition-all duration-300 hover:ring-2 hover:ring-primary/20">
                  <AvatarImage src="/placeholder.svg" alt={user?.username || ""} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 scale-in" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.username}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="transition-colors duration-200">
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="transition-colors duration-200">
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="transition-colors duration-200">
                <Link href="/archive" className="flex items-center">
                  <Archive className="mr-2 h-4 w-4" />
                  Archived Items
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
