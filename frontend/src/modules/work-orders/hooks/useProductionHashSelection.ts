import { useEffect } from 'react'
import type { OperationExecutionDto } from '../types/workOrder.types'

interface ProductionHashSelectionParams {
  hash: string
  executions: OperationExecutionDto[]
  setSelectedOperationId: (operationId: number) => void
  setExpandedOperationId: (operationId: number) => void
  setMaterialsOpen: (open: boolean) => void
}

export function useProductionHashSelection({
  hash,
  executions,
  setSelectedOperationId,
  setExpandedOperationId,
  setMaterialsOpen,
}: ProductionHashSelectionParams) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const executionMatch = hash.match(/^#operation-execution-(\d+)$/)

      if (executionMatch) {
        const executionId = Number(executionMatch[1])
        const execution = executions.find((item) => item.id === executionId)

        if (execution) {
          setSelectedOperationId(execution.routingOperationId)
          setExpandedOperationId(execution.routingOperationId)
        }
        return
      }

      const operationMatch = hash.match(/^#routing-operation-(\d+)$/)

      if (operationMatch) {
        setSelectedOperationId(Number(operationMatch[1]))
        return
      }

      if (hash.startsWith('#material-lot-')) {
        setMaterialsOpen(true)
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    executions,
    hash,
    setExpandedOperationId,
    setMaterialsOpen,
    setSelectedOperationId,
  ])
}
