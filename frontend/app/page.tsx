import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import LiveAuditDemo from '@/components/LiveAuditDemo'
import TrustSection from '@/components/TrustSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-cyber-dark-bg">
      {/* Hero Section with ID for anchor navigation */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Live Demo Section */}
      <LiveAuditDemo />

      {/* Trust & Social Proof */}
      <TrustSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
