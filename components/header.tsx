"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout, user,loading } = useAuthContext()

if (loading) {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-50"></header>
  );
}
  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">Estate Hub</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/properties" className="text-foreground hover:text-primary transition-colors">
            Properties
          </Link>
          <Link href="/about" className="text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/services" className="text-foreground hover:text-primary transition-colors">
            Services
          </Link>
          <Link href="/listings" className="text-foreground hover:text-primary transition-colors">
            Listings
          </Link>
          <Link href="/favorites" className="text-foreground hover:text-primary transition-colors">
            Favorites
          </Link>
          <ThemeToggle />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
              <Button className="bg-primary hover:bg-primary/90">Contact Agent</Button>
            </>
          ) : (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                <Avatar>
                  <AvatarImage src={user?.avatar || "/default-avatar.png"} alt={user?.username || "Profile"} />                  
                </Avatar>
      
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/create-property" className="flex items-center gap-2 cursor-pointer">
                    <span >+ Create Listing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-properties" className="flex items-center gap-2 cursor-pointer">
                    <span>My Properties</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                    <span>Your Favorites</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                    <User size={18} />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                variant="default"
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-deafault-foreground hover:text-primary" 
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-border md:hidden">
            <div className="flex flex-col p-4 gap-4">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                <ThemeToggle />
              </div>
              <Link href="/properties" className="text-foreground hover:text-primary transition-colors">
                Properties
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/services" className="text-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/listings" className="text-foreground hover:text-primary transition-colors">
                Listings
              </Link>
              <Link href="/favorites" className="text-foreground hover:text-primary transition-colors">
                Favorites
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Contact Agent
                  </Button>
                </>
              ) : (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted mb-3">
                     <Avatar>
                  <AvatarImage src={user?.avatar || "/default-avatar.png"} alt={user?.username || "Profile"} />
                  <AvatarFallback>{user?.email}
                  </AvatarFallback>
                </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.username || "Profile"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <Link href="/create-property" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      + Create Listing
                    </Button>
                  </Link>
                  <Link href="/my-properties" className="w-full block mt-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      My Properties
                    </Button>
                  </Link>
                  <Link href="/account" className="w-full block mt-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                      <Settings size={18} />
                      Account Settings
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2 bg-transparent" onClick={handleLogout}>
                    <LogOut size={18} />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
