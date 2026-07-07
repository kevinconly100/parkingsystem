import type { ParkedCar } from '../types'
import { formatDuration, formatTimestamp } from '../hooks/useParking'

interface Props {
  cars: (ParkedCar & { index: number })[]
  now: number
  count: number
}

export default function ParkingTable({ cars, now, count }: Props) {
  const hasCars = cars.length > 0

  return (
    <>
      {hasCars ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-left">Slot</th>
                <th className="px-4 py-3 text-left">Plate</th>
                <th className="px-4 py-3 text-left">Entry Time</th>
                <th className="px-4 py-3 text-left">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {cars.map(car => (
                <tr key={car.plateNumber} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">#{car.slotNumber}</td>
                  <td className="px-4 py-3 font-mono">{car.plateNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatTimestamp(car.entryTime)}</td>
                  <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{formatDuration(now - car.entryTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <p className="text-sm">No cars parked</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Total slots: 15</span>
        <span className="font-medium">{count} occupied</span>
      </div>
    </>
  )
}
