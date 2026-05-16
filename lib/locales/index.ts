import en from "./en.json"
import ar from "./ar.json"
import ur from "./ur.json"
import zh from "./zh.json"
import de from "./de.json"
import ja from "./ja.json"
import es from "./es.json"

export type TranslationValue = string | Record<string, unknown>
export type Translations = Record<string, TranslationValue>

const locales: Record<string, Translations> = {
  en: en as Translations,
  ar: ar as Translations,
  ur: ur as Translations,
  zh: zh as Translations,
  de: de as Translations,
  ja: ja as Translations,
  es: es as Translations,
}

export default locales
