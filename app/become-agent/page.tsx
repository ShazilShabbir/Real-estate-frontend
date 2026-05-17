"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/lib/auth-context"
import { api } from "@/lib/axios"
import { Shield, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useTranslation } from "@/lib/use-translation"

export default function BecomeAgentPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, isAgent } = useAuthContext()
  const router = useRouter()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    if (!isAuthenticated) { router.push("/login"); return }
    setApplying(true)
    try {
      await api.post("/auth/apply-agent")
      setApplied(true)
      toast.success(t("becomeAgent.applySuccess"))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("becomeAgent.applyError"))
    } finally { setApplying(false) }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("becomeAgent.signInTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("becomeAgent.signInDesc")}</p>
            <Link href="/login"><Button size="lg">{t("becomeAgent.signInBtn")}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (isAgent) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("becomeAgent.alreadyAgentTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("becomeAgent.alreadyAgentDesc")}</p>
            <Link href="/create-property"><Button size="lg">{t("becomeAgent.listPropertyBtn")}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (applied || user?.agentApplication?.status === "pending") {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("becomeAgent.pendingTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("becomeAgent.pendingDesc")}</p>
            <Link href="/"><Button variant="outline" size="lg"><ArrowLeft className="h-4 w-4 mr-2" /> {t("becomeAgent.backHomeBtn")}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{t("becomeAgent.heading")}</h1>
            <p className="text-muted-foreground mt-2">{t("becomeAgent.subtitle")}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t("becomeAgent.benefit1")}</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t("becomeAgent.benefit2")}</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t("becomeAgent.benefit3")}</p>
            </div>
          </div>

          <Button onClick={handleApply} disabled={applying} size="lg" className="w-full">
            {applying ? t("becomeAgent.applyingBtn") : t("becomeAgent.applyBtn")}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">{t("becomeAgent.footerNote")}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
