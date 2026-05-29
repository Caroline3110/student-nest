// ─── Subject Colour Map ───────────────────────────────────────────────────────
// Define each subject's colour once — reuse across timetable, exams, etc.
const SUBJECT_COLORS = {
  'Operating Systems':    '#6C6FFF',
  'Software Engineering': '#34D399',
  'GUI Development':      '#C084FC',
  'Probability & Matrices': '#F5A623',
};

// ─── Exams ────────────────────────────────────────────────────────────────────
export const sampleExams = [
  {
    id: 1,
    subject: 'Operating Systems',
    date: '2026-05-15',
    time: '09:00',
    location: 'Main Hall A',
    hoursNeeded: 20,
    hoursCompleted: 8,
  },
  {
    id: 2,
    subject: 'Software Engineering',
    date: '2026-05-18',
    time: '14:00',
    location: 'Main Hall B',
    hoursNeeded: 15,
    hoursCompleted: 5,
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const sampleTasks = [
  {
    id: 1,
    title: 'Complete OS coursework',
    category: 'Study',
    completed: false,
    priority: 'high',
    dueDate: '2026-04-20',
  },
  {
    id: 2,
    title: 'Read Chapter 5 - Databases',
    category: 'Study',
    completed: false,
    priority: 'medium',
    dueDate: '2026-04-25',
  },
  {
    id: 3,
    title: 'Buy groceries',
    category: 'Personal',
    completed: false,
    priority: 'low',
    dueDate: '2026-04-10',
  },
];

// ─── Timetable ────────────────────────────────────────────────────────────────
export const sampleTimetable = [
  {
    id: 1,
    subject: 'Operating Systems',
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Room 3.14',
    lecturer: 'Dr. Smith',
    color: SUBJECT_COLORS['Operating Systems'],
  },
  {
    id: 2,
    subject: 'Software Engineering',
    day: 'Monday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Lab 2.05',
    lecturer: 'Prof. Johnson',
    color: SUBJECT_COLORS['Software Engineering'],
  },
  {
    id: 3,
    subject: 'GUI Development',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Room 4.20',
    lecturer: 'Dr. Williams',
    color: SUBJECT_COLORS['GUI Development'],
  },
  {
    id: 4,
    subject: 'Operating Systems',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Room 3.14',
    lecturer: 'Dr. Smith',
    color: SUBJECT_COLORS['Operating Systems'],
  },
  {
    id: 5,
    subject: 'Probability & Matrices',
    day: 'Thursday',
    startTime: '13:00',
    endTime: '15:00',
    location: 'Lecture Hall C',
    lecturer: 'Prof. Davis',
    color: SUBJECT_COLORS['Probability & Matrices'],
  },
  {
    id: 6,
    subject: 'Software Engineering',
    day: 'Friday',
    startTime: '11:00',
    endTime: '13:00',
    location: 'Lab 2.05',
    lecturer: 'Prof. Johnson',
    color: SUBJECT_COLORS['Software Engineering'],
  },
];

// ─── Study Goals ──────────────────────────────────────────────────────────────
// weeklyHoursGoal:   target study hours for the week
// currentWeekHours:  hours logged so far this week
// studyStreak:       consecutive days studied
export const studyGoals = {
  weeklyHoursGoal: 30,
  currentWeekHours: 18,
  studyStreak: 5,
};