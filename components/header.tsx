"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User, Heart, Plus, ChevronDown, Building2, Settings, Shield, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/lib/auth-context"
import { useSite } from "@/lib/site-context"
import { useTranslation } from "@/lib/use-translation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function normalizeAssetUrl(url?: string | null) {
  if (!url) return url
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`
  }
  return url
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, isAdminOrAgent, logout, user, loading } = useAuthContext()
  const { siteLogo, siteName } = useSite()
  const { t } = useTranslation()
  const normalizedSiteLogo = normalizeAssetUrl(siteLogo)
  const normalizedAvatar = normalizeAssetUrl(user?.avatar) || "/default-avatar.png"
  const NAV_LINKS = [
    { href: "/properties", label: t("nav.properties") },
    { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
  ]
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobileView(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches)
      if (!e.matches) setIsOpen(false)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Focus trap & escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); toggleRef.current?.focus() }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  const handleLogout = () => { logout(); setIsOpen(false) }

  if (loading) {
    return <header className="h-16 border-b border-border bg-card sticky top-0 z-50" />
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-sm" : "bg-card border-b border-border"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
          {normalizedSiteLogo ? (
            <div className="relative h-15 flex items-center">
              <img src={normalizedSiteLogo} alt={siteName} className="h-full w-auto max-w-[300px] object-contain" />
            </div>
          ) : (
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {siteName}
          </span>
          )}
          
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group cursor-pointer">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-1 ring-offset-card">
                    <AvatarImage src={normalizedAvatar} alt={user?.username || "Profile"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-amber-500 text-primary-foreground text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-foreground leading-tight">{user?.username || "User"}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight truncate max-w-[100px]">{user?.email || ""}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl shadow-xl border-border/50 bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-3 p-3 mb-1 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={normalizedAvatar} alt={user?.username || "Profile"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-amber-500 text-primary-foreground font-bold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.username || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                  </div>
                </div>
                {isAdminOrAgent ? (
                  <DropdownMenuItem asChild>
                    <Link href="/create-property" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.listProperty")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.listPropertyDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/become-agent" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.becomeAgent")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.becomeAgentDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/my-properties" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/80 text-foreground/70">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.myProperties")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.myPropertiesDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {isAdminOrAgent && (
                  <DropdownMenuItem asChild>
                    <Link href="/agent/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/80 text-foreground/70">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.agentDashboard")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.agentDashboardDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/80 text-foreground/70">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.savedProperties")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.savedPropertiesDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/80 text-foreground/70">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.accountSettings")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.accountSettingsDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                        <p className="text-sm font-medium text-foreground">{t("nav.adminPanel")}</p>
                        <p className="text-xs text-muted-foreground">{t("nav.adminPanelDesc")}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 text-destructive">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("nav.signOut")}</p>
                    <p className="text-xs text-destructive/70">{t("nav.signOutDesc")}</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        {isMobileView && (
          <button
            ref={toggleRef}
            className="p-2.5 hover:bg-muted/50 rounded-lg transition-colors tap-target"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        {/* Mobile Menu Backdrop */}
        {isMobileView && isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu */}
        {isMobileView && isOpen && (
          <div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.navigationMenu")}
            className="fixed top-16 left-0 right-0 glass border-b border-border animate-fade-in z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <div className="flex flex-col p-4 gap-2">
              <div className="flex items-center justify-between px-2 py-3 border-b border-border mb-2">
                <span className="text-sm font-medium text-muted-foreground">{t("nav.appearance")}</span>
                <ThemeToggle />
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`px-3 py-3 rounded-lg text-base font-medium transition-colors tap-target justify-start ${
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border mt-2 pt-4">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={closeMenu} className="tap-target justify-start">
                      <Button variant="outline" size="default" className="w-full h-12 text-base">
                        {t("nav.signIn")}
                      </Button>
                    </Link>
                    <Link href="/login" onClick={closeMenu}>
                      <Button size="default" className="w-full h-12 text-base bg-primary hover:bg-primary/90">
                        {t("nav.getStarted")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={normalizedAvatar} alt={user?.username || "Profile"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-base font-medium text-foreground">{user?.username || "Profile"}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                    {isAdminOrAgent ? (
                      <Link href="/create-property" onClick={closeMenu}>
                        <Button variant="outline" size="default" className="w-full justify-start h-12 text-base">
                          <Plus className="h-5 w-5 mr-3" />
                          {t("nav.listProperty")}
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/become-agent" onClick={closeMenu}>
                        <Button variant="outline" size="default" className="w-full justify-start h-12 text-base border-amber-500/20 text-amber-500">
                          <Shield className="h-5 w-5 mr-3" />
                          {t("nav.becomeAgent")}
                        </Button>
                      </Link>
                    )}
                    <Link href="/my-properties" onClick={closeMenu}>
                      <Button variant="outline" size="default" className="w-full justify-start h-12 text-base mt-2">
                        <Building2 className="h-5 w-5 mr-3" />
                          {t("nav.myProperties")}
                        </Button>
                      </Link>
                      {isAdminOrAgent && (
                        <Link href="/agent/dashboard" onClick={closeMenu}>
                          <Button variant="outline" size="default" className="w-full justify-start h-12 text-base mt-2">
                            <BarChart3 className="h-5 w-5 mr-3" />
                            {t("nav.agentDashboard")}
                        </Button>
                      </Link>
                    )}
                    <Link href="/favorites" onClick={closeMenu}>
                      <Button variant="outline" size="default" className="w-full justify-start h-12 text-base mt-2">
                        <Heart className="h-5 w-5 mr-3" />
                          {t("nav.savedProperties")}
                        </Button>
                      </Link>
                      <Link href="/account" onClick={closeMenu}>
                        <Button variant="outline" size="default" className="w-full justify-start h-12 text-base mt-2">
                          <User className="h-5 w-5 mr-3" />
                          {t("nav.accountSettings")}
                      </Button>
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={closeMenu}>
                        <Button variant="outline" size="default" className="w-full justify-start h-12 text-base mt-2 border-amber-500/20 text-amber-500">
                          <Shield className="h-5 w-5 mr-3" />
                          {t("nav.adminPanel")}
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full justify-start h-12 text-base mt-2 text-destructive border-destructive/30"
                      onClick={() => { handleLogout(); closeMenu() }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {t("nav.signOut")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
