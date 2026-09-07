type SpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export default function Spinner({ size = 'lg' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <span className={`loading loading-spinner loading-${size}`}></span>
    </div>
  )
}
