import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const getMyAcceptedRequests = async () => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const q = query(
      collection(db, 'rideRequests'),
      where('userId', '==', auth.currentUser.uid),
      where('status', '==', 'accepted')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting accepted requests:', error);
    throw error;
  }
};