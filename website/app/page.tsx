import CMSBanner from "@/components/CMSBanner"
import ExploreSection from "@/components/ExploreSection"
import ProgramShowcase from "@/components/ProgramShowcase"
import WhyChooseEdGoing from "@/components/WhyChooseEdGoing"
import WhyChooseUs from "@/components/WhyChooseUs"
import Testimonials from "@/components/Testimonials"
import NewsletterSignup from "@/components/NewsletterSignup"
import CallToAction from "@/components/CallToAction"
import Footer from "@/components/Footer"
import PartnerLogos from "@/components/PartnerLogos"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <CMSBanner />
        <ExploreSection />
        <ProgramShowcase />
        <WhyChooseEdGoing />
        <WhyChooseUs />
        <Testimonials />
        <PartnerLogos limit={12} />
        <NewsletterSignup />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
