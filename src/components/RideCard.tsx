import { format } from 'date-fns';
import { MapPin, Clock, Users, Trash2, CheckCircle2, PencilIcon, EyeOff, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { checkRequestStatus } from '../services/rideService';
import { getUserById } from '../services/userService';
import { auth } from '../lib/firebase';
import type { Ride } from '../services/rideService';
import type { UserProfile } from '../services/userService';

interface RideCardProps {
  ride: Ride;
  onRequest: (rideId: string, seats: number) => void;
  isRequesting?: boolean;
  showRequest?: boolean;
  onDelete?: () => void;
  onToggleDormant?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const RideCard = ({ 
  ride, 
  onRequest, 
  isRequesting, 
  showRequest = true, 
  onDelete,
  onToggleDormant,
  onEdit,
  showActions = false
}: RideCardProps) => {
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [requestStatus, setRequestStatus] = useState<'none' | 'requested' | 'accepted'>('none');
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const formattedDate = format(new Date(ride.date), 'MMM do, yyyy');

  useEffect(() => {
    const loadData = async () => {
      if (ride.id && auth.currentUser) {
        const [status, ownerData] = await Promise.all([
          checkRequestStatus(ride.id, auth.currentUser.uid),
          getUserById(ride.userId)
        ]);
        setRequestStatus(status);
        setOwner(ownerData);
      }
    };
    loadData();
  }, [ride.id, ride.userId]);

  const handleRequest = async () => {
    if (ride.id) {
      await onRequest(ride.id, seatsNeeded);
      setRequestStatus('requested');
    }
  };

  const getRequestButton = () => {
    if (requestStatus === 'accepted') {
      return (
        <div className="flex items-center gap-2 text-green-600 px-4 py-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Accepted</span>
        </div>
      );
    }
    
    if (requestStatus === 'requested') {
      return (
        <div className="flex items-center gap-2 text-blue-600 px-4 py-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Requested</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <select
          value={seatsNeeded}
          onChange={(e) => setSeatsNeeded(Number(e.target.value))}
          className="p-2 border rounded-lg"
          disabled={isRequesting}
        >
          {[...Array(Math.min(ride.seats, 4))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} seat{i > 0 ? 's' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handleRequest}
          disabled={isRequesting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isRequesting ? 'Requesting...' : 'Request Ride'}
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${ride.dormant ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          {owner && (
            <div className="font-medium text-gray-900 mb-2">
              Offered by {owner.name}
              {requestStatus === 'accepted' && owner.isPublic && (
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {owner.telephone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {owner.email}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{ride.pickup}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>{formattedDate} at {ride.time}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span>{ride.seats} seats available</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {showActions && (
            <>
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit ride"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onToggleDormant}
                className={`${ride.dormant ? 'text-gray-400' : 'text-gray-600'} hover:text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors`}
                title={ride.dormant ? "Activate ride" : "Make dormant"}
              >
                <EyeOff className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete ride"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          
          {showRequest && !ride.dormant && ride.seats > 0 && getRequestButton()}
        </div>
      </div>
    </div>
  );
};

export default RideCard;