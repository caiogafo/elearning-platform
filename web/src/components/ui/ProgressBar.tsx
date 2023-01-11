import clsx from 'clsx'

interface Props {
  value: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value, className, showLabel = true }: Props) {
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Progresso</span>
          <span className="font-semibold text-primary-600">{value}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
