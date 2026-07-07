import ThemeToggle from './components/ThemeToggle'
import ConnectionStatus from './components/ConnectionStatus'
import ParkingForm from './components/ParkingForm'
import ParkingTable from './components/ParkingTable'
import StatusMessage from './components/StatusMessage'
import { useParking } from './hooks/useParking'

export default function App() {
  const { sortedCars, parkedCount, status, now, parkCar, removeCar, clearAll } = useParking()

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="fixed top-4 left-4 z-50">
        <ConnectionStatus />
      </div>
      <ThemeToggle />

      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            SmartPark
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rubavu parking management</p>
        </header>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5">
          <ParkingForm onPark={parkCar} onRemove={removeCar} onClearAll={clearAll} />
          <StatusMessage text={status.text} type={status.type} />
          <ParkingTable cars={sortedCars} now={now} count={parkedCount} />
        </div>
      </div>
    </div>
  )
}
