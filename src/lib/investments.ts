// lib/firebase/investments.ts
'use client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export async function fetchInvestments(firestore: ReturnType<typeof useFirestore>) {
  if (!firestore) return [];

  const investmentsRef = collection(firestore, 'investments');
  const q = query(investmentsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
