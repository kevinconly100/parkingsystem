import ThemeToggle from './components/ThemeToggle'
import ConnectionStatus from './components/ConnectionStatus'
import ParkingForm from './components/ParkingForm'
import ParkingTable from './components/ParkingTable'
import StatusMessage from './components/StatusMessage'
import { useParking } from './hooks/useParking'

export default function App() {
  const { sortedCars, parkedCount, status, now, parkCar, removeCar, clearAll } = useParking()

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 transition-all">
      <div className="fixed top-2 left-2 sm:top-4 sm:left-6 z-50">
        <ConnectionStatus />
      </div>
      <ThemeToggle />
      <h1 className="text-2xl sm:text-3xl md:text-5xl text-center neon-glow mb-4 sm:mb-6">
        SmartPark
      </h1>

      <div className="max-w-full sm:max-w-2xl md:max-w-4xl mx-auto bg-gray-900 p-2 sm:p-4 md:p-6 rounded-xl shadow-lg space-y-4 sm:space-y-6 neon">
        <ParkingForm onPark={parkCar} onRemove={removeCar} onClearAll={clearAll} />
        <StatusMessage text={status.text} type={status.type} />
        <ParkingTable cars={sortedCars} now={now} count={parkedCount} />
      </div>
    </div>
  )
}
