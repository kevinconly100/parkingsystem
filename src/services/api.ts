import type { ParkResponse, RemoveResponse, ParkingLotState } from '../types'

const BASE = import.meta.env.DEV
  ? '/api'
  : 'https://parkingsystem-api.vercel.app/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export const parkingApi = {
  async getLot(): Promise<ParkingLotState> {
    return request<ParkingLotState>('/lot')
  },

  async parkCar(plateNumber: string, slotNumber?: string): Promise<ParkResponse> {
    return request<ParkResponse>('/park', {
      method: 'POST',
      body: JSON.stringify({ plateNumber, slotNumber }),
    })
  },

  async removeCar(plateNumber: string): Promise<RemoveResponse> {
    return request<RemoveResponse>('/remove', {
      method: 'DELETE',
      body: JSON.stringify({ plateNumber }),
    })
  },

  async clearAll(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/clear', {
      method: 'DELETE',
    })
  },
}
