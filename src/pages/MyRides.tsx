// File: src/pages/MyRides.tsx

import { useState, useEffect } from 'react';
import {
  getMyRides,
  deleteRide,
  toggleRideStatus,
  getPendingRequestsForMyRides,
  updateRideRequest,
  type Ride,
  type RideRequest,
} from '../services/rideService';
import RideCard from '../components/RideCard';
import { useNavigate } from 'react-router-dom';

const MyRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRidesAndRequests = async () => {
    try {
      const [myRides, requests] = await Promise.all([
        getMyRides(),
        getPendingRequestsForMyRides(),
      ]);
      setRides(myRides);
      setPendingRequests(requests);
    } catch (err: any) {
      console.error('Error fetching rides or requests:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRidesAndRequests();
  }, []);

  const handleDelete = async (rideId: string) => {
    try {
      await deleteRide(rideId);
      setRides(rides.filter((ride) => ride.id !== rideId));
    } catch (err: any) {
      console.error('Error deleting ride:', err);
      setError(err.message || 'Failed to delete ride');
    }
  };

  const handleToggleStatus = async (rideId: string) => {
    try {
      await toggleRideStatus(rideId);
      fetchRidesAndRequests();
    } catch (err: any) {
      console.error('Error toggling ride status:', err);
      setError(err.message || 'Failed to update ride status');
    }
  };

  const handleEdit = (rideId: string) => {
    navigate(`/edit-ride/${rideId}`);
  };

  const handleRequestDecision = async (
    requestId: string,
    decision: 'accepted' | 'rejected'
  ) => {
    try {
      const result = await updateRideRequest(requestId, decision);
      if (result.success) {
        // Remove the request from the list
        setPendingRequests(
          pendingRequests.filter((request) => request.id !== requestId)
        );
        // Refresh rides to update their status
        fetchRidesAndRequests();
      } else {
        setError(result.message || 'Failed to update ride request');
      }
    } catch (err: any) {
      console.error('Error updating ride request:', err);
      setError(err.message || 'Failed to update ride request');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading your rides...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Rides</h2>

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Pending Ride Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border p-4 rounded">
                <p>
                  <strong>Name:</strong> {request.userName}
                </p>
                <p>
                  <strong>Telephone:</strong> {request.userTelephone}
                </p>
                <p>
                  <strong>Email:</strong> {request.userEmail}
                </p>
                <p>
                  <strong>Seats Requested:</strong> {request.seats}
                </p>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() =>
                      handleRequestDecision(request.id!, 'accepted')
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRequestDecision(request.id!, 'rejected')
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rides.length === 0 ? (
          <p className="text-gray-500">You have not offered any rides.</p>
        ) : (
          rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onDelete={() => handleDelete(ride.id!)}
              onToggleStatus={() => handleToggleStatus(ride.id!)}
              onEdit={() => handleEdit(ride.id!)}
              showActions={true}
              showRequest={false}
              onRequest={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyRides;
