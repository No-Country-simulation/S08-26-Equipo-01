interface ProductionBlockerProps {
  text: string
}

export function ProductionBlocker({ text }: ProductionBlockerProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
      <p className="text-[8px] leading-4 text-amber-800">{text}</p>
    </div>
  )
}
