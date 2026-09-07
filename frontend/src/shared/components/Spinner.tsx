type SpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const Spinner = ({ size = 'lg' }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <span className={`loading loading-spinner loading-${size}`}></span>
    </div>
  )
}
