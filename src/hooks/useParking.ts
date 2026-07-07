import { useState, useEffect, useCallback } from 'react'
import type { ParkedCar } from '../types'
import { TOTAL_SLOTS, PLATE_REGEX } from '../types'
import { parkingApi } from '../services/api'

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
    parkingApi.getLot().then(data => setSlots(data.slots)).catch(() => {})
  }, [])

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

  const refreshLot = useCallback(async () => {
    try {
      const data = await parkingApi.getLot()
      setSlots(data.slots)
    } catch {
      showMessage('Failed to fetch parking data.', 'error')
    }
  }, [showMessage])

  const parkCar = useCallback(async (plateNumber: string, slotInput?: string) => {
    const plate = plateNumber.trim().toUpperCase()

    if (!plate) {
      showMessage('Please enter a plate number.', 'error')
      return false
    }

    if (!PLATE_REGEX.test(plate)) {
      showMessage('Invalid plate format. Example: RAC123A', 'error')
      return false
    }

    try {
      const result = await parkingApi.parkCar(plate, slotInput)
      await refreshLot()
      showMessage(result.message, 'success')
      return true
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to park car.', 'error')
      return false
    }
  }, [showMessage, refreshLot])

  const removeCar = useCallback(async (plateNumber: string) => {
    const plate = plateNumber.trim().toUpperCase()

    if (!plate) {
      showMessage('Enter plate number to remove.', 'error')
      return false
    }

    try {
      const result = await parkingApi.removeCar(plate)
      await refreshLot()
      showMessage(result.message, 'success')
      return true
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to remove car.', 'error')
      return false
    }
  }, [showMessage, refreshLot])

  const clearAll = useCallback(async () => {
    try {
      const result = await parkingApi.clearAll()
      await refreshLot()
      showMessage(result.message, 'success')
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to clear lot.', 'error')
    }
  }, [showMessage, refreshLot])

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
