// Crisis and support services shown in MindNest → Get help now.
//
// Last checked: October 2026. Re-check every number and link before each
// term — services change (NHS 111 option 2 replaced several local mental
// health lines in April 2026).
//
// Names and descriptions live in i18n under mindnest.crisis.lines.<id>.
// Each line has at most one action: call (phone number), text (SMS number +
// prefilled body) or url. Lines with no action are information only.
// Sections are listed most urgent first.

export const SUPPORT_SECTIONS = [
  {
    id: 'danger',
    lines: [
      { id: 'emergency', call: '999', urgent: true },
    ],
  },
  {
    id: 'talk',
    lines: [
      { id: 'samaritans', call: '116 123' },
      { id: 'shout', text: '85258', body: 'SHOUT' },
      { id: 'nhs111', call: '111' },
      // Papyrus also has a text line, but sources disagree on the number —
      // add it once confirmed on papyrus-uk.org.
      { id: 'papyrus', call: '0800 068 4141' },
    ],
  },
  {
    id: 'abroad',
    lines: [
      { id: 'abroadEmergency', call: '112' },
      { id: 'findHelpline', url: 'https://findahelpline.com' },
    ],
  },
  {
    id: 'notUrgent',
    lines: [
      { id: 'university' },
    ],
  },
];

// Check-in moods heavy enough to show the "talk to someone" card.
export const HEAVY_MOODS = new Set(['numb', 'overwhelmed', 'burntOut', 'lonely']);
