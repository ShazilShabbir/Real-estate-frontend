import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Home, TrendingUp, ShieldCheck, Search } from "lucide-react"

const services = [
  {
    icon: Search,
    title: "Property Search",
    description: "Advanced search filters and market analysis to find your perfect property",
  },
  {
    icon: Home,
    title: "Home Buying",
    description: "Full support from property selection to closing, including financing guidance",
  },
  {
    icon: TrendingUp,
    title: "Investment Advisory",
    description: "Expert market analysis and investment recommendations for real estate portfolios",
  },
  {
    icon: ShieldCheck,
    title: "Property Management",
    description: "Comprehensive management services for rental and commercial properties",
  },
  {
    icon: Home,
    title: "Home Staging",
    description: "Professional staging services to maximize property appeal and value",
  },
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description: "In-depth market reports and price evaluations for informed decisions",
  },
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Our Services</h1>
            <p className="text-lg text-muted-foreground">Comprehensive real estate solutions tailored to your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <Icon className="text-primary mb-4" size={32} />
                  <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-transparent border border-border rounded-lg p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Services?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>✓ Expert team with 15+ years of combined experience</p>
              <p>✓ Personalized approach to every client</p>
              <p>✓ Transparent pricing and no hidden fees</p>
              <p>✓ Cutting-edge technology and market insights</p>
              <p>✓ 24/7 customer support</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
