import Feather from '@expo/vector-icons/Feather';
import Colors from '../constants/Colors';

// Every icon in the app comes from Feather, so the line weight stays even.
// Names are from https://feathericons.com.
export default function Icon({ name, size = 20, color = Colors.warmGrey, style }) {
  return <Feather name={name} size={size} color={color} style={style} />;
}

// The icon each Home/Explore feature uses, kept here so Home, Explore and
// anything else that lists features agree.
export const FEATURE_ICONS = {
  living: 'home',
  roommates: 'users',
  study: 'calendar',
  tutors: 'award',
  housekeeper: 'feather',
  jobs: 'briefcase',
  budget: 'dollar-sign',
  wellbeing: 'heart',
};
