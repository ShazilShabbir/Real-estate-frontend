export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold">P</span>
              </div>
              <span className="font-semibold">Prime Properties</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">Your trusted partner in luxury real estate</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Browse Properties
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Buying
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Selling
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Investment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>info@primeproperties.com</li>
              <li>(555) 123-4567</li>
              <li>123 Luxury Lane, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <p className="text-center text-sm text-primary-foreground/60">
            © 2025 Prime Properties. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
