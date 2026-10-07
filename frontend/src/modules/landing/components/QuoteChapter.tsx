import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { QuoteSection } from './QuoteSection'

export function QuoteChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[3]

  if (!stage) return null

  return <QuoteSection stage={stage} reducedMotion={reducedMotion} />
}
