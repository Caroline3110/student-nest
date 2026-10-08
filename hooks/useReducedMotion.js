import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// True when the phone's "Reduce Motion" setting is on, so looping
// decorative animations can stay still.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduced)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduced);
    return () => sub?.remove?.();
  }, []);

  return reduced;
}
