import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { DeliverySection } from './DeliverySection'

export function DeliveryChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[7]

  if (!stage) return null

  return <DeliverySection stage={stage} reducedMotion={reducedMotion} />
}
