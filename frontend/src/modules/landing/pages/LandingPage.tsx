import { CaseChapter } from '../components/CaseChapter'
import { DeliveryChapter } from '../components/DeliveryChapter'
import { FinalCta } from '../components/FinalCta'
import { LandingHeader } from '../components/LandingHeader'
import { ProductionChapter } from '../components/ProductionChapter'
import { QualityChapter } from '../components/QualityChapter'
import { QuoteChapter } from '../components/QuoteChapter'
import { ScrollStory } from '../components/ScrollStory'
import { WorkOrderChapter } from '../components/WorkOrderChapter'
import '../landing.css'
import '../landingAudit.css'

export function LandingPage() {
  return (
    <div className="qt-landing-root min-h-screen overflow-x-clip bg-[#020617]">
      <a
        href="#qt-main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-xl focus:not-sr-only"
      >
        Saltar al contenido
      </a>
      <LandingHeader />
      <main id="qt-main-content">
        <ScrollStory />
        <CaseChapter />
        <QuoteChapter />
        <WorkOrderChapter />
        <ProductionChapter />
        <QualityChapter />
        <DeliveryChapter />
        <FinalCta />
      </main>
    </div>
  )
}
