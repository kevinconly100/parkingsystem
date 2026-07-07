import { useState, useEffect, useCallback } from 'react'
import type { ParkedCar } from '../types'
import { TOTAL_SLOTS, HOURLY_RATE_FIRST_HOUR, HOURLY_RATE_ADDITIONAL, ONE_HOUR_MS, PLATE_REGEX } from '../types'
export type MessageType = 'success' | 'error' | 'info'

interface StatusMessage {
  text: string
  type: MessageType
}

export function useParking() {
  const [slots, setSlots] = useState<(ParkedCar | null)[]>(new Array(TOTAL_SLOTS).fill(null))
  const [status, setStatus] = useState<StatusMessage>({ text: '', type: 'info' })
  const [now, setNow] = useState(Date.now())

  const sortedCars = slots
    .map((car, i) => car ? { ...car, index: i } : null)
    .filter((c): c is ParkedCar & { index: number } => c !== null)
    .sort((a, b) => a.slotNumber - b.slotNumber)

  const freeSlots = slots.map((s, i) => s === null ? i + 1 : null).filter((s): s is number => s !== null)
  const parkedCount = sortedCars.length

  useEffect(() => {
    const data = localStorage.getItem('smartParkLotData')
    if (data) {
      try {
        const loaded = JSON.parse(data)
        if (Array.isArray(loaded) && loaded.length === TOTAL_SLOTS) {
          setSlots(loaded)
        }
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('smartParkLotData', JSON.stringify(slots))
  }, [slots])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!status.text) return
    const id = setTimeout(() => setStatus({ text: '', type: 'info' }), 5000)
    return () => clearTimeout(id)
  }, [status])

  const showMessage = useCallback((text: string, type: MessageType = 'info') => {
    setStatus({ text, type })
  }, [])

  const parkCar = useCallback((plateNumber: string, slotInput?: string) => {
    const plate = plateNumber.trim().toUpperCase()

    if (!plate) {
      showMessage('Please enter a plate number.', 'error')
      return false
    }

    if (!PLATE_REGEX.test(plate)) {
      showMessage('Invalid plate format. Example: RAC123A', 'error')
      return false
    }

    if (slots.some(car => car && car.plateNumber === plate)) {
      showMessage(`Car "${plate}" is already parked.`, 'error')
      return false
    }

    if (freeSlots.length === 0) {
      showMessage('Parking lot is full!', 'error')
      return false
    }

    let chosenSlotIndex = -1

    if (slotInput && slotInput.trim() !== '') {
      const slotNum = parseInt(slotInput, 10)
      if (isNaN(slotNum) || slotNum < 1 || slotNum > TOTAL_SLOTS) {
        showMessage('Slot number must be between 1 and 15.', 'error')
        return false
      }
      if (slots[slotNum - 1] !== null) {
        showMessage(`Slot ${slotNum} is already occupied.`, 'error')
        return false
      }
      chosenSlotIndex = slotNum - 1
    } else {
      chosenSlotIndex = slots.findIndex(s => s === null)
    }

    const newCar: ParkedCar = {
      plateNumber: plate,
      slotNumber: chosenSlotIndex + 1,
      entryTime: Date.now(),
    }

    const newSlots = [...slots]
    newSlots[chosenSlotIndex] = newCar
    setSlots(newSlots)
    showMessage(`Car "${plate}" parked in slot ${newCar.slotNumber}.`, 'success')
    return true
  }, [slots, freeSlots, showMessage])

  const removeCar = useCallback((plateNumber: string) => {
    const plate = plateNumber.trim().toUpperCase()

    if (!plate) {
      showMessage('Enter plate number to remove.', 'error')
      return false
    }

    const index = slots.findIndex(car => car && car.plateNumber === plate)
    if (index === -1) {
      showMessage(`Car "${plate}" not found.`, 'error')
      return false
    }

    const car = slots[index]!
    const exitTime = Date.now()
    const duration = exitTime - car.entryTime

    let bill = HOURLY_RATE_FIRST_HOUR
    const remaining = duration - ONE_HOUR_MS
    if (remaining > 0) {
      bill += Math.ceil(remaining / ONE_HOUR_MS) * HOURLY_RATE_ADDITIONAL
    }

    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
    showMessage(
      `Car "${plate}" removed. Time: ${formatDuration(duration)}. Bill: Rwf ${bill.toLocaleString()}.`,
      'success'
    )
    return true
  }, [slots, showMessage])

  const clearAll = useCallback(() => {
    setSlots(new Array(TOTAL_SLOTS).fill(null))
    showMessage('All slots cleared.', 'success')
  }, [showMessage])

  return {
    slots,
    sortedCars,
    freeSlots,
    parkedCount,
    status,
    now,
    parkCar,
    removeCar,
    clearAll,
  }
}

function formatDuration(ms: number) {
  if (ms < 0) ms = 0
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map(u => u.toString().padStart(2, '0')).join(':')
}

export function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString('en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export { formatDuration }
