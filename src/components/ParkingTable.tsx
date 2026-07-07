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
      <div className={`overflow-x-auto ${hasCars ? '' : 'hidden'}`}>
        <table className="min-w-100 sm:min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3">Slot</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3">Plate</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3">Entry Time</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {cars.map(car => (
              <tr key={car.plateNumber} className="text-center">
                <td className="py-2">{car.slotNumber}</td>
                <td className="py-2">{car.plateNumber}</td>
                <td className="py-2">{formatTimestamp(car.entryTime)}</td>
                <td className="py-2">{formatDuration(now - car.entryTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasCars && (
        <div className="text-center text-gray-500 py-4 sm:py-6 text-sm sm:text-base">
          No cars parked currently.
        </div>
      )}

      <div className="text-right font-bold text-xs sm:text-base">
        Parked: {count} / 15
      </div>
    </>
  )
}
