import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ListingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Featured Listings</h1>
          <p className="text-lg text-muted-foreground mb-12">Scroll down to see our featured properties</p>
          <div id="featured" className="scroll-smooth">
            <p className="text-center py-20 text-muted-foreground">
              Featured listings will appear here. This section mirrors the featured properties from the homepage.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
