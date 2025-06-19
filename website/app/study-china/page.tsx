import { Suspense } from "react"
import StudyChinaFeatures from "@/components/StudyChinaFeatures"
import ChinaProgramsSection from "@/components/ChinaProgramsSection"
import Footer from "@/components/Footer"
import { LanguageInitializer } from "@/components/LanguageInitializer"
import StudyChinaCMSHero from "@/components/StudyChinaCMSHero"

export default function StudyChinaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <LanguageInitializer />
      </Suspense>
      <Suspense fallback={
        <div className="relative h-[400px] w-full overflow-hidden bg-gray-200 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      }>
        <StudyChinaCMSHero
          pageName="study-china"
          fallbackTitle="游学中国新视角：激发灵感、建立联系、实现蜕变的旅程。"
          fallbackDescription="深入中国顶尖大学，参访知名企业，体验丰富文化，开启您的国际教育之旅"
          fallbackBackgroundImage="/uploads/1749482112470-e3jnwfjrk9h.jpg"
        />
      </Suspense>
      <main className="flex-grow">
        <StudyChinaFeatures />
        <Suspense fallback={
          <div className="py-16 bg-gray-50 min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        }>
          <div id="programs">
            <ChinaProgramsSection />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
