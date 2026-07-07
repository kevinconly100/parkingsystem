import type { MessageType } from '../hooks/useParking'

interface Props {
  text: string
  type: MessageType
}

const styleMap: Record<MessageType, string> = {
  success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
}

export default function StatusMessage({ text, type }: Props) {
  if (!text) return null
  return (
    <div
      className={`px-4 py-3 rounded-lg border text-sm font-medium ${styleMap[type]}`}
      aria-live="polite"
    >
      {text}
    </div>
  )
}
