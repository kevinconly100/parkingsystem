import type { ParkedCar, ParkResponse, RemoveResponse, ParkingLotState } from '../types'

const LOCAL_STORAGE_KEY = 'smartParkLotData'

export const parkingApi = {
  async getLot(): Promise<ParkingLotState> {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      return { slots: JSON.parse(data) }
    }
    return { slots: new Array(15).fill(null) }
  },

  async saveLot(slots: (ParkedCar | null)[]): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slots))
  },

  async parkCar(car: ParkedCar): Promise<ParkResponse> {
    return { success: true, message: `Car "${car.plateNumber}" parked in slot ${car.slotNumber}.`, car }
  },

  async removeCar(plateNumber: string, bill: number, duration: number): Promise<RemoveResponse> {
    return { success: true, message: `Car "${plateNumber}" removed. Bill: Rwf ${bill.toLocaleString()}.`, bill, duration }
  },

  async clearAll(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'All slots cleared.' }
  },
}
