import { useState, useCallback, type FormEvent } from 'react'
import { TOTAL_SLOTS, PLATE_REGEX } from '../types'

interface Props {
  onPark: (plate: string, slot?: string) => Promise<boolean>
  onRemove: (plate: string) => Promise<boolean>
  onClearAll: () => void
}

export default function ParkingForm({ onPark, onRemove, onClearAll }: Props) {
  const [plate, setPlate] = useState('')
  const [slot, setSlot] = useState('')

  const plateValid = PLATE_REGEX.test(plate.trim().toUpperCase())
  const slotValid = slot === '' || (parseInt(slot) >= 1 && parseInt(slot) <= TOTAL_SLOTS)
  const canPark = plateValid && slotValid

  const handlePark = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!canPark) return
    const ok = await onPark(plate, slot)
    if (ok) { setPlate(''); setSlot('') }
  }, [canPark, plate, slot, onPark])

  const handleRemove = useCallback(async () => {
    const ok = await onRemove(plate)
    if (ok) setPlate('')
  }, [plate, onRemove])

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
  const btnClass = "w-full px-4 py-2.5 rounded-lg font-medium text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"

  return (
    <div className="space-y-4">
      <form onSubmit={handlePark} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={plate}
          onChange={e => setPlate(e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="Plate Number (e.g., RAC123A)"
        />
        <input
          value={slot}
          onChange={e => setSlot(e.target.value)}
          className={inputClass}
          placeholder="Slot No. (1–15)"
          type="number"
          min={1}
          max={TOTAL_SLOTS}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={!canPark} className={`${btnClass} bg-blue-600 hover:bg-blue-700`}>
            Park
          </button>
          <button type="button" onClick={handleRemove} className={`${btnClass} bg-red-600 hover:bg-red-700`}>
            Remove
          </button>
        </div>
      </form>

      <button
        onClick={onClearAll}
        className="w-full px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        Clear All
      </button>
    </div>
  )
}
