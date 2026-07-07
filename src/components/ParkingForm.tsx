import { useState, useCallback, type FormEvent } from 'react'
import { TOTAL_SLOTS, PLATE_REGEX } from '../types'

interface Props {
  onPark: (plate: string, slot?: string) => boolean
  onRemove: (plate: string) => boolean
  onClearAll: () => void
}

export default function ParkingForm({ onPark, onRemove, onClearAll }: Props) {
  const [plate, setPlate] = useState('')
  const [slot, setSlot] = useState('')

  const plateValid = PLATE_REGEX.test(plate.trim().toUpperCase())
  const slotValid = slot === '' || (parseInt(slot) >= 1 && parseInt(slot) <= TOTAL_SLOTS)
  const canPark = plateValid && slotValid

  const handlePark = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (!canPark) return
    const ok = onPark(plate, slot)
    if (ok) {
      setPlate('')
      setSlot('')
    }
  }, [canPark, plate, slot, onPark])

  const handleRemove = useCallback(() => {
    const ok = onRemove(plate)
    if (ok) setPlate('')
  }, [plate, onRemove])

  return (
    <div className="space-y-4 sm:space-y-6">
      <form onSubmit={handlePark} className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
        <input
          value={plate}
          onChange={e => setPlate(e.target.value.toUpperCase())}
          className="p-2 sm:p-3 neon rounded-md w-full"
          placeholder="Plate Number (e.g., RAC123A)"
        />
        <input
          value={slot}
          onChange={e => setSlot(e.target.value)}
          className="p-2 sm:p-3 neon rounded-md w-full"
          placeholder="Slot No. (1–15)"
          type="number"
          min={1}
          max={TOTAL_SLOTS}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={!canPark}
            className="w-full bg-green-700 text-white p-2 sm:p-3 rounded-md font-semibold btn disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Park
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="w-full bg-red-700 text-white p-2 sm:p-3 rounded-md font-semibold btn cursor-pointer"
          >
            Remove
          </button>
        </div>
      </form>

      <button
        onClick={onClearAll}
        className="w-full bg-yellow-500 text-black p-2 sm:p-3 rounded-md font-semibold btn cursor-pointer"
      >
        Clear All
      </button>
    </div>
  )
}
