"use client"

import type React from "react"
import { Providers } from "./providers"

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
