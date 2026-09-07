import ErrorAlert from '@/shared/components/ErrorAlert'
import Spinner from '@/shared/components/Spinner'
import { EMPTY_STATE_MESSAGE, SUBTITLE, TITLE } from '../../constants'
import type { User } from '../../types'
import UserGrid from '../organisms/UserGrid'

type SystemDesignTemplateProps = {
  users: User[]
  isLoading: boolean
  isError: boolean
  error: string | null
  onRetry: () => void
}

export default function SystemDesignTemplate({
  users,
  isLoading,
  isError,
  error,
  onRetry,
}: SystemDesignTemplateProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">{TITLE}</h1>
        <p className="text-base-content/70">{SUBTITLE}</p>
      </header>

      {isLoading && <Spinner />}

      {isError && error && <ErrorAlert message={error} onRetry={onRetry} />}

      {!isLoading && !isError && users.length === 0 && (
        <p className="text-base-content/70">{EMPTY_STATE_MESSAGE}</p>
      )}

      {!isLoading && !isError && users.length > 0 && <UserGrid users={users} />}
    </div>
  )
}
