import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { QualitySection } from './QualitySection'

export function QualityChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[6]

  if (!stage) return null

  return <QualitySection stage={stage} reducedMotion={reducedMotion} />
}
