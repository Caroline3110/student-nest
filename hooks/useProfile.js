import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// The signed-in student's profile lives at /users/{uid}.
// profile is undefined while loading and null if they haven't set one up yet.
const ProfileContext = createContext({ profile: undefined });

export function ProfileProvider({ uid, children }) {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    if (!uid) { setProfile(undefined); return; }
    return onSnapshot(
      doc(db, 'users', uid),
      snap => setProfile(snap.exists() ? snap.data() : null),
      err => { console.log('Profile load failed:', err.message); setProfile(null); },
    );
  }, [uid]);

  return <ProfileContext.Provider value={{ profile }}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext).profile;

export const PROFILE_FIELDS = ['name', 'university', 'campus', 'major', 'year', 'bio'];

export const saveProfile = (uid, fields) => {
  const data = { updatedAt: serverTimestamp() };
  PROFILE_FIELDS.forEach(key => {
    if (fields[key] !== undefined) data[key] = String(fields[key]).trim();
  });
  if (fields.language) data.language = fields.language;
  if (fields.profileComplete) data.profileComplete = true;
  return setDoc(doc(db, 'users', uid), data, { merge: true });
};
