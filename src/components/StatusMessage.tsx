import type { MessageType } from '../hooks/useParking'

interface Props {
  text: string
  type: MessageType
}

const bgMap: Record<MessageType, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}

export default function StatusMessage({ text, type }: Props) {
  if (!text) return null
  return (
    <div
      className={`p-3 rounded-md text-center text-base sm:text-lg font-medium ${bgMap[type]}`}
      aria-live="polite"
    >
      {text}
    </div>
  )
}
