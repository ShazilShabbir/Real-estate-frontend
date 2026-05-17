import { useCallback } from "react"
import { useSite } from "@/lib/site-context"
import locales from "@/lib/locales"
import type { TranslationValue } from "@/lib/locales"

function resolveKey(obj: TranslationValue, key: string): string | undefined {
  const keys = key.split(".")
  let result: TranslationValue = obj
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, TranslationValue>)[k]
    } else {
      return undefined
    }
  }
  return typeof result === "string" ? result : undefined
}

export function useTranslation() {
  const { language } = useSite()
  const lang = language || "en"
  const translations = locales[lang] || locales.en
  const english = locales.en

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const count = params?.count
      const pluralKey = count === 1 ? key : `${key}_plural`
      let result =
        resolveKey(translations, pluralKey) ||
        resolveKey(translations, key) ||
        resolveKey(english, pluralKey) ||
        resolveKey(english, key) ||
        key
      if (params) {
        result = result.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? ""))
      }
      return result
    },
    [lang],
  )

  return { t, language: lang }
}
