import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-xl transition-all h-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-manrope font-bold text-2xl tracking-tighter text-on-surface">MediBook</span>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Home</Link>
            <Link href="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Doctors</Link>
            <Link href="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32 lg:py-40 flex flex-col items-center text-center">
          <div className="bg-surface-container-low rounded-2xl p-2 mb-8 border border-outline-variant/15 flex items-center gap-2 shadow-ambient">
            <div className="bg-secondary-fixed w-2 h-2 rounded-full animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-on-surface uppercase">The Digital Sanctuary for your healthcare journey</span>
          </div>
          
          <h1 className="font-manrope font-bold text-5xl md:text-7xl tracking-tight max-w-4xl tracking-tighter text-on-surface mb-8">
            Your Health, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Simply Scheduled</span>
          </h1>
          
          <p className="font-inter text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12">
            Find top-rated doctors and book appointments in seconds. A sanctuary for your healthcare journey, built with clinical precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/register">Find a Doctor</Link>
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-8 bg-surface-container-highest shadow-ambient">
              Are you a doctor?
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-surface-container-low py-24 px-6 relative overflow-hidden">
           <div className="container mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-ambient border border-outline-variant/15">
                  <h3 className="font-manrope font-semibold text-2xl mb-4">Easy Booking</h3>
                  <p className="text-on-surface-variant leading-relaxed">Filter by specialty, insurance, and availability. Book your next check-up in under 60 seconds with our intuitive interface.</p>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-ambient border border-outline-variant/15">
                  <h3 className="font-manrope font-semibold text-2xl mb-4">Top Specialists</h3>
                  <p className="text-on-surface-variant leading-relaxed">Access a curated network of board-certified professionals. Every doctor on MediBook is vetted for quality and empathy.</p>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-ambient border border-outline-variant/15">
                  <h3 className="font-manrope font-semibold text-2xl mb-4">24/7 Management</h3>
                  <p className="text-on-surface-variant leading-relaxed">Manage your appointments, health records, and prescriptions from any device, anytime. Clinical care that travels with you.</p>
                </div>
              </div>
           </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-surface border-t border-surface-container-hard py-12 px-6">
        <div className="container mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-on-surface-variant text-sm font-medium">© {new Date().getFullYear()} MediBook Health Systems Inc.</p>
          <div className="flex flex-wrap gap-6 justify-center">
             <Link href="#" className="text-on-surface-variant text-sm hover:text-primary transition-colors">Privacy Policy</Link>
             <Link href="#" className="text-on-surface-variant text-sm hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
