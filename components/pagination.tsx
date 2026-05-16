"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="h-11 w-11 rounded-xl border-border/60 hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p < 0 ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-muted-foreground text-sm select-none">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p)}
            className={`h-11 w-11 rounded-xl text-sm font-medium ${
              p === page ? "" : "border-border/60 hover:bg-muted"
            }`}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-11 w-11 rounded-xl border-border/60 hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
