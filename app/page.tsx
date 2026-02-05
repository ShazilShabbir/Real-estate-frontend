import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Featured } from "@/components/featured"
import { SearchSection } from "@/components/search-section"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <SearchSection />
      <Featured />
      <Contact />
      <Footer />
    </main>
  )
}
