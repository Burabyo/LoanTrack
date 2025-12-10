'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

export function useCollection<T = any>(
  targetRefOrQuery:
    | CollectionReference<DocumentData>
    | Query<DocumentData>
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItem = WithId<T>;
  type StateData = ResultItem[] | null;

  const [data, setData] = useState<StateData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // Track the last reference to ensure memoization
  const lastRef = useRef<typeof targetRefOrQuery | null>(null);

  // ---- 🔍 Memoization Check (safe + silent) ----
  if (
    targetRefOrQuery &&
    lastRef.current &&
    targetRefOrQuery !== lastRef.current
  ) {
    console.warn(
      '%c⚠️ Firestore ref changed between renders. Ensure useMemo is applied.',
      'color: orange; font-weight: bold;',
      { previous: lastRef.current, current: targetRefOrQuery }
    );
  }

  // Save the current ref as the last stable one
  lastRef.current = targetRefOrQuery ?? null;

  useEffect(() => {
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItem[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));

        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const path =
          targetRefOrQuery.type === 'collection'
            ? (targetRefOrQuery as CollectionReference).path
            : (
                targetRefOrQuery as unknown as InternalQuery
              )._query.path.canonicalString();

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
