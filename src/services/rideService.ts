// File: src/services/rideService.ts

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface Ride {
  id?: string;
  userId: string;
  date: string;
  time: string;
  seats: number;
  pickup: string;
  createdAt: Timestamp;
  status: 'active' | 'pending' | 'dormant';
}

export interface RideRequest {
  id?: string;
  rideId: string;
  userId: string;
  userName: string;       // Added
  userTelephone: string;  // Added
  userEmail: string;      // Added
  seats: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

const ridesCollection = collection(db, 'rides');
const rideRequestsCollection = collection(db, 'rideRequests');

export const getRides = async (): Promise<Ride[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const q = query(
      ridesCollection,
      where('date', '>=', todayStr)
    );

    const querySnapshot = await getDocs(q);
    let rides = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ride)
    );

    // Filter dormant rides - only show if user has an accepted request
    if (rides.some(ride => ride.status === 'dormant')) {
      const acceptedRequestsQuery = query(
        rideRequestsCollection,
        where('userId', '==', auth.currentUser.uid),
        where('status', '==', 'accepted')
      );
      const acceptedRequestsSnapshot = await getDocs(acceptedRequestsQuery);
      const acceptedRideIds = new Set(
        acceptedRequestsSnapshot.docs.map(doc => doc.data().rideId)
      );

      rides = rides.filter(ride => 
        ride.status !== 'dormant' || acceptedRideIds.has(ride.id!)
      );
    }

    // Sort the rides by date
    rides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return rides;
  } catch (error) {
    console.error('Error getting rides:', error);
    throw error;
  }
};

export const getMyRides = async (): Promise<Ride[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const q = query(ridesCollection, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ride)
    );
  } catch (error) {
    console.error('Error getting user rides:', error);
    throw error;
  }
};

export const toggleRideStatus = async (rideId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const rideRef = doc(db, 'rides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      throw new Error('Ride not found');
    }

    if (rideDoc.data()?.userId !== auth.currentUser.uid) {
      throw new Error('Not authorized to update this ride');
    }

    const currentStatus = rideDoc.data()?.status || 'active';
    let newStatus: 'active' | 'dormant';

    newStatus = currentStatus === 'active' ? 'dormant' : 'active';

    if (currentStatus === 'dormant') {
      // When reactivating, set seats to 1
      await updateDoc(rideRef, {
        status: newStatus,
        seats: 1
      });
    } else {
      await updateDoc(rideRef, { status: newStatus });
    }
  } catch (error) {
    console.error('Error toggling ride status:', error);
    throw error;
  }
};

export const deleteRide = async (rideId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const rideRef = doc(db, 'rides', rideId);
    const rideDoc = await getDoc(rideRef);

    if (!rideDoc.exists()) {
      throw new Error('Ride not found');
    }

    if (rideDoc.data()?.userId !== auth.currentUser.uid) {
      throw new Error('Not authorized to delete this ride');
    }

    await deleteDoc(rideRef);
  } catch (error) {
    console.error('Error deleting ride:', error);
    throw error;
  }
};

export const requestRide = async (rideId: string, seats: number = 1): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  // Get the ride to check seat availability
  const rideRef = doc(db, 'rides', rideId);
  const rideDoc = await getDoc(rideRef);
  if (!rideDoc.exists()) {
    throw new Error('Ride not found');
  }
  const ride = rideDoc.data() as Ride;

  if (seats > ride.seats) {
    throw new Error(`Cannot request ${seats} seats. Only ${ride.seats} seats available.`);
  }

  try {
    // Get the user's profile
    const userProfileDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const userProfile = userProfileDoc.data();

    // Create the ride request with user info
    await addDoc(rideRequestsCollection, {
      rideId,
      userId: auth.currentUser.uid,
      userName: userProfile?.name || '',
      userTelephone: userProfile?.telephone || '',
      userEmail: userProfile?.email || '',
      seats,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Update the ride's status to 'pending'
    const rideRef = doc(db, 'rides', rideId);
    await updateDoc(rideRef, { status: 'pending' });
  } catch (error) {
    console.error('Error requesting ride:', error);
    throw error;
  }
};

export const getRideRequests = async (): Promise<RideRequest[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const q = query(
      rideRequestsCollection,
      where('userId', '==', auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as RideRequest)
    );
  } catch (error) {
    console.error('Error getting ride requests:', error);
    throw error;
  }
};

export const getPendingRequestsForMyRides = async (): Promise<RideRequest[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const myRides = await getMyRides();
    const rideIds = myRides.map((ride) => ride.id).filter(Boolean) as string[];

    if (rideIds.length === 0) return [];

    const q = query(
      rideRequestsCollection,
      where('rideId', 'in', rideIds),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as RideRequest)
    );
  } catch (error) {
    console.error('Error getting pending ride requests:', error);
    throw error;
  }
};

export const updateRideRequest = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; message?: string }> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const requestRef = doc(db, 'rideRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    if (!requestDoc.exists()) throw new Error('Request not found');

    const request = requestDoc.data() as RideRequest;

    // Only the ride owner can accept or reject the request
    const rideRef = doc(db, 'rides', request.rideId);
    const rideDoc = await getDoc(rideRef);
    if (!rideDoc.exists()) throw new Error('Ride not found');
    const ride = rideDoc.data() as Ride;

    if (ride.userId !== auth.currentUser.uid) {
      throw new Error('Not authorized to update this ride request');
    }

    // Check seat availability if accepting the request
    if (status === 'accepted') {
      if (request.seats > ride.seats) {
        return {
          success: false,
          message: `Cannot accept request. Only ${ride.seats} seats available.`
        };
      }
    }

    // Update the ride request status
    await updateDoc(requestRef, { status });

    if (status === 'accepted') {
      // Update available seats
      const updatedSeats = ride.seats - request.seats;
      await updateDoc(rideRef, { 
        seats: updatedSeats,
        status: updatedSeats === 0 ? 'dormant' : 'active' 
      });

      // Update the ride's status to 'dormant'
      // TODO: Send emails to both parties (implement email sending logic here)
    } else if (status === 'rejected') {
      // Update the ride's status back to 'active'
      await updateDoc(rideRef, { status: 'active' });
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating ride request:', error);
    throw error;
  }
};

export const checkRequestStatus = async (
  rideId: string,
  userId: string
): Promise<'none' | 'pending' | 'accepted' | 'rejected'> => {
  try {
    const q = query(
      rideRequestsCollection,
      where('rideId', '==', rideId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return 'none';

    const request = querySnapshot.docs[0].data() as RideRequest;
    return request.status;
  } catch (error) {
    console.error('Error checking request status:', error);
    throw error;
  }
};
