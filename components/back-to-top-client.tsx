"use client"

import dynamic from "next/dynamic"

const BackToTop = dynamic(() => import("@/components/back-to-top").then(mod => ({ default: mod.BackToTop })), {
  ssr: false,
})

export function BackToTopClient() {
  return <BackToTop />
}
