import { useState, useEffect } from 'react';
import { getMyRides, deleteRide, getRideRequests, updateRideRequest, toggleRideDormant } from '../services/rideService';
import { getUserById } from '../services/userService';
import { sendRideConfirmationEmails } from '../services/emailService';
import RideCard from '../components/RideCard';
import type { Ride, RideRequest } from '../services/rideService';
import type { UserProfile } from '../services/userService';
import { Check, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RequestWithUser extends RideRequest {
  user?: UserProfile;
}

const MyRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [rideRequests, setRideRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [userRides, requests] = await Promise.all([
        getMyRides(),
        getRideRequests()
      ]);

      // Get user details for each request
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          try {
            const user = await getUserById(request.userId);
            return { ...request, user };
          } catch (err) {
            console.error(`Error fetching user for request ${request.id}:`, err);
            return request;
          }
        })
      );

      setRides(userRides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setRideRequests(requestsWithUsers);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to delete this ride offer?')) return;

    try {
      await deleteRide(rideId);
      setRides(rides.filter(ride => ride.id !== rideId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete ride offer');
    }
  };

  const handleToggleDormant = async (rideId: string) => {
    try {
      await toggleRideDormant(rideId);
      setRides(rides.map(ride => 
        ride.id === rideId ? { ...ride, dormant: !ride.dormant } : ride
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update ride status');
    }
  };

  const handleEdit = (ride: Ride) => {
    navigate('/create-ride', { state: { editRide: ride } });
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const request = rideRequests.find(r => r.id === requestId);
      const ride = rides.find(r => r.id === request?.rideId);
      
      if (!request?.user || !ride) {
        throw new Error('Missing request or ride information');
      }

      // First update the request status
      await updateRideRequest(requestId, 'accepted');

      // Get the owner's profile
      const ownerProfile = await getUserById(ride.userId);

      // Send confirmation emails
      await sendRideConfirmationEmails({
        ownerName: ownerProfile.name,
        ownerEmail: ownerProfile.email,
        riderName: request.user.name,
        riderEmail: request.user.email,
        date: ride.date,
        time: ride.time,
        pickup: ride.pickup,
        seats: request.seats
      });

      // Refresh the data
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your ride offers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {rideRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Ride Requests</h3>
          <div className="space-y-4">
            {rideRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-gray-600">
                    New request for ride on {rides.find(r => r.id === request.rideId)?.date}
                    {request.user && (
                      <span className="ml-2 text-sm">
                        from {request.user.name}
                      </span>
                    )}
                  </p>
                  {request.user && request.status === 'accepted' && (
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {request.user.telephone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {request.user.email}
                      </div>
                    </div>
                  )}
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => request.id && handleAcceptRequest(request.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">My Ride Offers</h2>
        {rides.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't created any ride offers yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onRequest={() => {}}
                showRequest={false}
                showActions={true}
                onDelete={() => ride.id && handleDelete(ride.id)}
                onToggleDormant={() => ride.id && handleToggleDormant(ride.id)}
                onEdit={() => handleEdit(ride)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;