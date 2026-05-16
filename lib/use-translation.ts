import { useCallback } from "react"
import { useSite } from "@/lib/site-context"
import locales from "@/lib/locales"
import type { TranslationValue } from "@/lib/locales"

export function useTranslation() {
  const { language } = useSite()
  const lang = language || "en"
  const translations = locales[lang] || locales.en

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split(".")
      let result: TranslationValue = translations as TranslationValue
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, TranslationValue>)[k]
        } else {
          return key
        }
      }
      if (typeof result !== "string") return key
      if (params) {
        return result.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? ""))
      }
      return result
    },
    [lang],
  )

  return { t, language: lang }
}
