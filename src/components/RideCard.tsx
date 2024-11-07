// File: src/components/RideCard.tsx

import { format } from 'date-fns';
import {
  MapPin,
  Clock,
  Users,
  Trash2,
  PencilIcon,
  EyeOff,
  Eye,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Hourglass,
} from 'lucide-react';
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
  onToggleStatus?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const RideCard = ({
  ride,
  onRequest,
  isRequesting,
  showRequest = true,
  onDelete,
  onToggleStatus,
  onEdit,
  showActions = false,
}: RideCardProps) => {
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [requestStatus, setRequestStatus] =
    useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const formattedDate = format(new Date(ride.date), 'MMM do, yyyy');

  useEffect(() => {
    const loadData = async () => {
      if (ride.id && auth.currentUser) {
        const [status, ownerData] = await Promise.all([
          checkRequestStatus(ride.id, auth.currentUser.uid),
          getUserById(ride.userId),
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
      setRequestStatus('pending');
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

    if (requestStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 px-4 py-2">
          <Hourglass className="w-5 h-5" />
          <span>Pending</span>
        </div>
      );
    }

    if (requestStatus === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600 px-4 py-2">
          <XCircle className="w-5 h-5" />
          <span>Rejected</span>
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
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${
        ride.status !== 'active' ? 'opacity-60' : ''
      }`}
    >
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
            {requestStatus === 'accepted' ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ride.pickup)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {ride.pickup}
              </a>
            ) : (
              <span>{ride.pickup}</span>
            )}
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>
              {formattedDate} at {ride.time}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span>{ride.seats} seats available</span>
          </div>

          <div className="flex items-center text-gray-600">
            <span className="font-semibold">Status:</span>
            <span className="ml-2 capitalize">{ride.status}</span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {showActions && (
            <div className="flex space-x-2">
              {ride.status === 'dormant' && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit ride"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              )}
              <button
                onClick={onToggleStatus}
                className={`${
                  ride.status === 'dormant' ? 'text-gray-400' : 'text-gray-600'
                } hover:text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors`}
                title={
                  ride.status === 'dormant' ? 'Activate ride' : 'Make dormant'
                }
              >
                {ride.status === 'dormant' 
                  ? <Eye className="w-5 h-5" title="Reactivate ride" /> 
                  : <EyeOff className="w-5 h-5" title="Make dormant" />
                }
                <span className="sr-only">{ride.status === 'dormant' ? 'Reactivate ride' : 'Make dormant'}</span>
              </button>

              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete ride"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {showRequest &&
            ride.status === 'active' &&
            ride.seats > 0 &&
            getRequestButton()}
        </div>
      </div>
    </div>
  );
};

export default RideCard;
