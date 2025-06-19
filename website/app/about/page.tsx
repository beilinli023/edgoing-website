import CMSPageHero from "@/components/CMSPageHero"
import AboutStory from "@/components/AboutStory"
import AboutMission from "@/components/AboutMission"
import AboutValues from "@/components/AboutValues"
import Footer from "@/components/Footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CMSPageHero
        pageName="about"
        fallbackTitle="关于EdGoing"
        fallbackDescription="赋能国际教育文化交流"
        fallbackBackgroundImage="/uploads/1749482112470-limd1eseua.jpg"
      />
      <main className="flex-grow bg-white">
        <AboutStory />
        <AboutMission />
        <AboutValues />
      </main>
      <Footer />
    </div>
  )
}
