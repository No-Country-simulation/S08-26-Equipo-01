import { Navigate, useSearchParams } from 'react-router-dom'

export function OperationalResourcesPage() {
  const [searchParams] = useSearchParams()

  if (searchParams.get('tab') === 'materials') {
    const next = new URLSearchParams()
    const materialId = searchParams.get('materialId')
    const lotId = searchParams.get('lotId')
    if (materialId) next.set('materialId', materialId)
    if (lotId) next.set('lotId', lotId)
    const query = next.toString()
    return <Navigate to={query ? `/materials?${query}` : '/materials'} replace />
  }

  return <Navigate to="/machines" replace />
}
