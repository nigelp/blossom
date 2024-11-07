// File: src/pages/FindRide.tsx

import { useState, useEffect } from 'react';
import { getRides, requestRide, checkRequestStatus, type Ride } from '../services/rideService';
import RideCard from '../components/RideCard';
import { auth } from '../lib/firebase';

const FindRide = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const fetchedRides = await getRides();
        // Filter out user's own rides
        const otherRides = fetchedRides.filter(ride => ride.userId !== auth.currentUser?.uid);
        setRides(otherRides);
      } catch (err: any) {
        console.error('Error fetching rides:', err);
        setError(err.message || 'Failed to load rides');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const handleRequestRide = async (rideId: string, seats: number) => {
    setIsRequesting(true);
    try {
      await requestRide(rideId, seats);
    } catch (err: any) {
      console.error('Error requesting ride:', err);
      setError(err.message || 'Failed to request ride');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading rides...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Available Rides</h2>
      <div className="space-y-4">
        {rides.length === 0 ? (
          <p className="text-gray-500">No rides available at the moment.</p>
        ) : (
          rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onRequest={handleRequestRide}
              isRequesting={isRequesting}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FindRide;
