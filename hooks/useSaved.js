import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Profiles and places the student tapped the heart on, kept at
// /users/{uid}/saved/{id}. Only they can read or write it, under the
// owner rule that already covers every /users/{uid} subcollection.
export function useSaved() {
  const uid = auth.currentUser?.uid;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    return onSnapshot(
      collection(db, 'users', uid, 'saved'),
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => { console.error('Error loading saved items:', err); setLoading(false); },
    );
  }, [uid]);

  const ids = new Set(items.map(i => i.id));

  // Saving keeps a copy of what the card showed, so the Saved tab can be
  // listed without reading every profile again.
  const toggle = async (id, data) => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'saved', id);
    try {
      if (ids.has(id)) await deleteDoc(ref);
      else await setDoc(ref, { ...data, savedAt: serverTimestamp() });
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  return { items, ids, loading, toggle };
}
