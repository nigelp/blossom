import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface UserProfile {  name: string;
  telephone: string;
  email: string;
}

export const getUserProfile = async () => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    
    // Return default values if no profile exists
    return {
      name: '',
      telephone: '',
      email: auth.currentUser?.email || ''
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserProfile> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

export const updateUserProfile = async (profile: UserProfile) => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};