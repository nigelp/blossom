import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Ride } from '../services/rideService';

const CreateRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editRide = location.state?.editRide as Ride | undefined;
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    seats: '',
    pickup: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editRide) {
      setFormData({
        date: editRide.date,
        time: editRide.time,
        seats: editRide.seats.toString(),
        pickup: editRide.pickup
      });
    }
  }, [editRide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to create a ride offer');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editRide?.id) {
        // Update existing ride
        const rideRef = doc(db, 'rides', editRide.id);
        await updateDoc(rideRef, {
          ...formData,
          seats: parseInt(formData.seats),
          updatedAt: new Date()
        });
      } else {
        // Create new ride
        await addDoc(collection(db, 'rides'), {
          ...formData,
          userId: user.uid,
          seats: parseInt(formData.seats),
          createdAt: new Date(),
          status: 'active'
        });
      }
      
      navigate('/my-rides');
    } catch (error: any) {
      console.error('Error creating/updating ride:', error);
      setError(error.message || 'Error creating ride offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {editRide ? 'Edit Ride Offer' : 'Create Ride Offer'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Time *</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Available Seats *</label>
          <input
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            min="1"
            max="8"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pick-up Location *</label>
          <input
            type="text"
            value={formData.pickup}
            onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter pickup location"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isSubmitting ? 'Saving...' : (editRide ? 'Update Ride Offer' : 'Create Ride Offer')}
        </button>
      </form>
    </div>
  );
};

export default CreateRide;