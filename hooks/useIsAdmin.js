import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// A user is an admin if /admins/{uid} exists. Firestore rules enforce the
// same check on writes, so this only decides whether to show admin UI.
export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    let cancelled = false;
    getDoc(doc(db, 'admins', uid))
      .then(snap => { if (!cancelled) setIsAdmin(snap.exists()); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, []);

  return isAdmin;
}
