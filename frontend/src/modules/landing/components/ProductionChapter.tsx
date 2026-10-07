import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { ProductionSection } from './ProductionSection'

export function ProductionChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[5]

  if (!stage) return null

  return <ProductionSection stage={stage} reducedMotion={reducedMotion} />
}
