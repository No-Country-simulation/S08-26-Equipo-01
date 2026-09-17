import type { RequestListProps } from '../../types/props'
import { RequestCard } from '../molecules/RequestCard'

export const RequestList = ({ requests, onSelect }: RequestListProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}