import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Car {
  id?: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  userId: string;
  createdAt: Date;
}

export const addCar = async (carData: Omit<Car, 'id' | 'userId' | 'createdAt'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  return addDoc(collection(db, 'cars'), {
    ...carData,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const getUserCars = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const carsRef = collection(db, 'cars');
  const q = query(carsRef, where('userId', '==', user.uid));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Car[];
};

export const deleteCar = async (carId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  return deleteDoc(doc(db, 'cars', carId));
};