"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  for (let i = start; i <= end; i++) pages.push(i)

  if (start > 2) pages.unshift(-1)
  if (start > 1) pages.unshift(1)
  if (end < totalPages - 1) pages.push(-2)
  if (end < totalPages) pages.push(totalPages)

  const b =
    "h-9 min-w-9 rounded-lg border-border/40 text-sm font-medium transition-all duration-200 flex items-center justify-center"
  const a =
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 border-primary"
  const i =
    "text-muted-foreground hover:bg-accent hover:text-foreground"

  return (
    <div className="flex flex-col items-center gap-4 py-6 mt-16 border-t border-border/20">
      <span className="text-sm text-muted-foreground/60">
        Page <span className="font-semibold text-foreground/80">{page}</span> of{" "}
        <span className="font-semibold text-foreground/80">{totalPages}</span>
        {" "}&middot;{" "}
        <span className="text-foreground/70">{total}</span> properties found
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className={cn(b, "max-sm:hidden", page <= 1 && "opacity-30 pointer-events-none")}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(b, page <= 1 && "opacity-30 pointer-events-none")}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, idx) =>
            p < 0 ? (
              <span
                key={`e-${idx}`}
                className="flex items-center justify-center w-7 h-9 text-muted-foreground/30 select-none text-sm"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(p)}
                className={cn(b, p === page ? a : i)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(b, page >= totalPages && "opacity-30 pointer-events-none")}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className={cn(b, "max-sm:hidden", page >= totalPages && "opacity-30 pointer-events-none")}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
