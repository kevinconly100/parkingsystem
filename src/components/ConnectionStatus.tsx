import { useEffect, useState } from 'react'

export default function ConnectionStatus() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await fetch('/api/health')
        const data = await res.json()
        if (mounted) setConnected(data.status === 'ok')
      } catch {
        if (mounted) setConnected(false)
      }
    }

    check()
    const id = setInterval(check, 5000)

    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  )
}
