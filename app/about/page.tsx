"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle } from "lucide-react"
import { useTranslation } from "@/lib/use-translation"

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("about.heading")}</h1>
            <p className="text-lg text-muted-foreground">{t("about.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <img src="/real-estate-office-team.jpg" alt={t("about.storyTitle")} className="rounded-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("about.storyTitle")}</h2>
              <p className="text-muted-foreground mb-4">{t("about.storyPara1")}</p>
              <p className="text-muted-foreground mb-6">{t("about.storyPara2")}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">{t("about.achievement1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">{t("about.achievement2")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">{t("about.achievement3")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">{t("about.achievement4")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-12 mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">{t("about.valuesTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t("about.integrity")}</h3>
                <p className="text-muted-foreground">{t("about.integrityDesc")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t("about.excellence")}</h3>
                <p className="text-muted-foreground">{t("about.excellenceDesc")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t("about.innovation")}</h3>
                <p className="text-muted-foreground">{t("about.innovationDesc")}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">{t("about.teamTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: t("about.teamMember1"), role: t("about.teamRole1") },
                { name: t("about.teamMember2"), role: t("about.teamRole2") },
                { name: t("about.teamMember3"), role: t("about.teamRole3") },
              ].map((member) => (
                <div key={member.name} className="bg-card border border-border rounded-lg p-6 text-center">
                  <img
                    src="/professional-headshot.png"
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
