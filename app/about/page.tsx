import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Prime Properties</h1>
            <p className="text-lg text-muted-foreground">Your trusted partner in real estate excellence</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <img src="/real-estate-office-team.jpg" alt="Our team" className="rounded-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2010, Prime Properties has been at the forefront of luxury real estate for over a decade. Our
                commitment to excellence and customer satisfaction has made us the trusted choice for discerning
                property buyers and sellers.
              </p>
              <p className="text-muted-foreground mb-6">
                With a team of experienced agents and market analysts, we provide unmatched expertise in residential,
                commercial, and investment properties across the region.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">500+ successful transactions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">$2B+ in total property value managed</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">Award-winning customer service</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">15+ years of market expertise</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-12 mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Integrity</h3>
                <p className="text-muted-foreground">
                  We operate with transparency and honesty in all transactions, building long-term relationships based
                  on trust.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every aspect of our service, from property selection to customer support.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We leverage cutting-edge technology to provide the best market insights and property discovery
                  experience.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah Johnson", role: "Founder & CEO" },
                { name: "Michael Chen", role: "Lead Agent" },
                { name: "Emma Rodriguez", role: "Property Manager" },
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
