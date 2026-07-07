import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light')

  useEffect(() => {
    document.body.classList.toggle('light-mode', isLight)
    localStorage.setItem('theme', isLight ? 'light' : 'dark')
  }, [isLight])

  return (
    <button
      onClick={() => setIsLight(p => !p)}
      className="fixed top-2 right-2 sm:top-4 sm:right-6 px-3 sm:px-4 py-2 neon rounded-full text-xs sm:text-sm font-semibold btn z-50 cursor-pointer"
    >
      {isLight ? 'Dark Mode' : 'Light Mode'}
    </button>
  )
}
