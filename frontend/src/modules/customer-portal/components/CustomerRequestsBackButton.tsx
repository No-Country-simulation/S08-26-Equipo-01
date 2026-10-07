import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'

interface CustomerRequestsBackButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function CustomerRequestsBackButton({
  onClick,
  disabled = false,
}: CustomerRequestsBackButtonProps) {
  return (
    <CompactBackButton
      label="Volver a solicitudes"
      onClick={onClick}
      disabled={disabled}
    />
  )
}
