import { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { addCar } from '../services/carService';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded: () => void;
}

interface CarForm {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

const AddCarModal = ({ isOpen, onClose, onCarAdded }: AddCarModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CarForm>();

  const onSubmit = async (data: CarForm) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await addCar(data);
      reset();
      onCarAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error adding car');
      console.error('Error adding car:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add a Car</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              {...register('make', { required: 'Make is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.make && (
              <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              {...register('model', { required: 'Model is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.model && (
              <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              {...register('year', { 
                required: 'Year is required',
                min: { value: 1900, message: 'Invalid year' },
                max: { value: new Date().getFullYear(), message: 'Invalid year' }
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <input
              type="text"
              {...register('color', { required: 'Color is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              {...register('licensePlate', { required: 'License plate is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.licensePlate && (
              <p className="text-red-500 text-sm mt-1">{errors.licensePlate.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Adding...' : 'Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;