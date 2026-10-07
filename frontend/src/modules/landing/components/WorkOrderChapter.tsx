import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { landingStory } from '../model/landingStory'
import { WorkOrderSection } from './WorkOrderSection'

export function WorkOrderChapter() {
  const reducedMotion = useReducedMotionPreference()
  const stage = landingStory[4]

  if (!stage) return null

  return <WorkOrderSection stage={stage} reducedMotion={reducedMotion} />
}
