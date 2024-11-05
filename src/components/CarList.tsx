import { useEffect, useState } from 'react';
import { Car as CarIcon, Trash2 } from 'lucide-react';
import { getUserCars, deleteCar, type Car } from '../services/carService';

const CarList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCars = async () => {
    try {
      const carsList = await getUserCars();
      setCars(carsList);
    } catch (err: any) {
      setError(err.message || 'Error loading cars');
      console.error('Error loading cars:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await deleteCar(carId);
      setCars(cars.filter(car => car.id !== carId));
    } catch (err: any) {
      setError(err.message || 'Error deleting car');
      console.error('Error deleting car:', err);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading cars...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No cars added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cars.map((car) => (
        <div
          key={car.id}
          className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
        >
          <div>
            <h3 className="font-medium">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-600">
              {car.color} • {car.licensePlate}
            </p>
          </div>
          <button
            onClick={() => car.id && handleDelete(car.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CarList;