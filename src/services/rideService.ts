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
  Timestamp 
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
  dormant?: boolean;
}

export interface RideRequest {
  id?: string;
  rideId: string;
  userId: string;
  seats: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

const ridesCollection = collection(db, 'rides');
const rideRequestsCollection = collection(db, 'rideRequests');

export const getRides = async (): Promise<Ride[]> => {
  try {
    const q = query(ridesCollection, where('dormant', '!=', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ride));
  } catch (error) {
    console.error('Error getting rides:', error);
    throw error;
  }
};

export const toggleRideDormant = async (rideId: string): Promise<void> => {
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
    
    const currentDormant = rideDoc.data()?.dormant || false;
    await updateDoc(rideRef, {
      dormant: !currentDormant
    });
  } catch (error) {
    console.error('Error toggling ride dormant status:', error);
    throw error;
  }
};

// Rest of the existing functions remain unchanged
export const getMyRides = async (): Promise<Ride[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  try {
    const q = query(ridesCollection, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ride));
  } catch (error) {
    console.error('Error getting user rides:', error);
    throw error;
  }
};

export const getRideRequests = async (): Promise<RideRequest[]> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const myRides = await getMyRides();
    if (myRides.length === 0) return [];
    
    const rideIds = myRides.map(ride => ride.id).filter(id => id !== undefined) as string[];
    if (rideIds.length === 0) return [];
    
    const q = query(
      rideRequestsCollection,
      where('rideId', 'in', rideIds),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RideRequest));
  } catch (error) {
    console.error('Error getting ride requests:', error);
    throw error;
  }
};

export const updateRideRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const requestRef = doc(db, 'rideRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    if (!requestDoc.exists()) throw new Error('Request not found');

    const request = requestDoc.data() as RideRequest;
    
    if (status === 'accepted') {
      const rideRef = doc(db, 'rides', request.rideId);
      const rideDoc = await getDoc(rideRef);
      if (!rideDoc.exists()) throw new Error('Ride not found');
      
      const ride = rideDoc.data() as Ride;
      if (ride.seats < request.seats) throw new Error('Not enough seats available');
      
      await updateDoc(rideRef, {
        seats: ride.seats - request.seats
      });
    }

    await updateDoc(requestRef, { status });
  } catch (error) {
    console.error('Error updating ride request:', error);
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

  try {
    await addDoc(rideRequestsCollection, {
      rideId,
      userId: auth.currentUser.uid,
      seats,
      status: 'pending',
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error requesting ride:', error);
    throw error;
  }
};

export const checkRequestStatus = async (rideId: string, userId: string): Promise<'none' | 'requested' | 'accepted'> => {
  try {
    const q = query(
      rideRequestsCollection,
      where('rideId', '==', rideId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return 'none';
    
    const request = querySnapshot.docs[0].data() as RideRequest;
    return request.status === 'accepted' ? 'accepted' : 'requested';
  } catch (error) {
    console.error('Error checking request status:', error);
    throw error;
  }
};