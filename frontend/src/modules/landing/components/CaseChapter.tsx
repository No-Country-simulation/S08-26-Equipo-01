import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { CaseSection } from './CaseSection'

export function CaseChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[2]

  if (!stage) return null

  return <CaseSection stage={stage} reducedMotion={reducedMotion} />
}
