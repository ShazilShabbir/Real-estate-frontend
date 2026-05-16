import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { Featured } from "@/components/featured"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <CategoriesSection />
      <Featured />
      <Contact />
      <Footer />
    </main>
  )
}
