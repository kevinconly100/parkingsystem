export interface ParkedCar {
  plateNumber: string
  slotNumber: number
  entryTime: number
}

export interface ParkingLotState {
  slots: (ParkedCar | null)[]
}

export interface ParkResponse {
  success: boolean
  message: string
  car?: ParkedCar
}

export interface RemoveResponse {
  success: boolean
  message: string
  bill?: number
  duration?: number
}

export const TOTAL_SLOTS = 15
export const HOURLY_RATE_FIRST_HOUR = 500
export const HOURLY_RATE_ADDITIONAL = 300
export const ONE_HOUR_MS = 60 * 60 * 1000
export const PLATE_REGEX = /^RA[BCDEFGHJKLNPSTVZ]\d{3}[A-Z]$/
