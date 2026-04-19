import type { TrendPoint } from "@/components/hydrawav3/recovery-trend-chart"

export type CareStatus = "active" | "new" | "maintenance" | "paused"

export type SessionRecord = {
  date: string
  protocol: string
  score: number
  delta: string
  notes: string
}

export type CareGoal = {
  label: string
  progress: number
}

export type PatientStats = {
  recoveryScore: number
  scoreDelta: string
  rangeOfMotion: string
  romDelta: string
  asymmetry: string
  asymmetryDelta: string
  sessionsCompleted: number
  sessionsPlanned: number
  adherence: number
  goalDate: string
}

export type Patient = {
  id: string
  name: string
  age: number
  sex: string
  email: string
  phone: string
  focus: string
  referredBy: string
  tags: string[]
  status: CareStatus
  nextAppointment: string
  lastSession: string
  stats: PatientStats
  trend: TrendPoint[]
  sessions: SessionRecord[]
  goals: CareGoal[]
  flag?: string
}

const baseTrend: TrendPoint[] = [
  { label: "W1", score: 54, baseline: 58 },
  { label: "W2", score: 58, baseline: 60 },
  { label: "W3", score: 62, baseline: 62 },
  { label: "W4", score: 66, baseline: 64 },
  { label: "W5", score: 71, baseline: 66 },
  { label: "W6", score: 74, baseline: 68 },
  { label: "W7", score: 78, baseline: 70 },
  { label: "W8", score: 82, baseline: 72 },
]

export const patients: Patient[] = [
  {
    id: "alex-morgan",
    name: "Alex Morgan",
    age: 34,
    sex: "Male",
    email: "alex.morgan@mail.co",
    phone: "+1 (415) 555-0142",
    focus: "Post-op right shoulder",
    referredBy: "Dr. Okafor",
    tags: ["Post-op shoulder", "Mobility"],
    status: "active",
    nextAppointment: "Today · 09:00",
    lastSession: "3 days ago",
    stats: {
      recoveryScore: 82,
      scoreDelta: "+8",
      rangeOfMotion: "148°",
      romDelta: "+12°",
      asymmetry: "4%",
      asymmetryDelta: "-3%",
      sessionsCompleted: 18,
      sessionsPlanned: 24,
      adherence: 96,
      goalDate: "Jun 15, 2026",
    },
    trend: baseTrend,
    sessions: [
      {
        date: "Apr 18",
        protocol: "H3-Beta · 18 min",
        score: 82,
        delta: "+4",
        notes: "Full ROM restored on abduction. Asymmetry 7% → 4%.",
      },
      {
        date: "Apr 11",
        protocol: "H3-Beta · 18 min",
        score: 78,
        delta: "+4",
        notes: "HRV baseline improving. Slight stiffness post-session.",
      },
      {
        date: "Apr 04",
        protocol: "H3-Alpha · 22 min",
        score: 74,
        delta: "+3",
        notes: "Breathing rate stabilised. Good posture control.",
      },
      {
        date: "Mar 28",
        protocol: "H3-Alpha · 22 min",
        score: 71,
        delta: "+5",
        notes: "First scan after acute flare-up. Scapular tracking poor.",
      },
    ],
    goals: [
      { label: "Regain full shoulder abduction", progress: 82 },
      { label: "Reduce pain VAS below 3", progress: 64 },
      { label: "Restore symmetry > 95%", progress: 58 },
    ],
    flag: "Asymmetry flagged on scapular tracking last session. Consider adjusting to H3-Gamma protocol.",
  },
  {
    id: "priya-chandra",
    name: "Priya Chandra",
    age: 29,
    sex: "Female",
    email: "priya.chandra@mail.co",
    phone: "+1 (628) 555-0190",
    focus: "Marathon recovery · Low HRV",
    referredBy: "Self-referred",
    tags: ["Marathon recovery", "Low HRV"],
    status: "active",
    nextAppointment: "Tomorrow · 10:15",
    lastSession: "Yesterday",
    stats: {
      recoveryScore: 82,
      scoreDelta: "+6",
      rangeOfMotion: "132°",
      romDelta: "+4°",
      asymmetry: "3%",
      asymmetryDelta: "-1%",
      sessionsCompleted: 9,
      sessionsPlanned: 12,
      adherence: 100,
      goalDate: "May 30, 2026",
    },
    trend: [
      { label: "W1", score: 62, baseline: 60 },
      { label: "W2", score: 66, baseline: 62 },
      { label: "W3", score: 70, baseline: 64 },
      { label: "W4", score: 73, baseline: 66 },
      { label: "W5", score: 76, baseline: 68 },
      { label: "W6", score: 79, baseline: 70 },
      { label: "W7", score: 80, baseline: 71 },
      { label: "W8", score: 82, baseline: 72 },
    ],
    sessions: [
      {
        date: "Apr 17",
        protocol: "H3-Beta · 18 min",
        score: 82,
        delta: "+3",
        notes: "HRV recovered to baseline. Leg symmetry within target.",
      },
      {
        date: "Apr 12",
        protocol: "H3-Beta · 18 min",
        score: 79,
        delta: "+3",
        notes: "Reported improved sleep. Calf stiffness reduced.",
      },
      {
        date: "Apr 05",
        protocol: "H3-Alpha · 22 min",
        score: 76,
        delta: "+3",
        notes: "Post-race flush protocol. Hamstring tension lower.",
      },
    ],
    goals: [
      { label: "Restore HRV above 65ms", progress: 78 },
      { label: "Return to weekly long runs", progress: 70 },
    ],
  },
  {
    id: "marcus-lee",
    name: "Marcus Lee",
    age: 41,
    sex: "Male",
    email: "marcus.lee@mail.co",
    phone: "+1 (212) 555-0171",
    focus: "Lower back · Desk worker",
    referredBy: "Dr. Patel",
    tags: ["Lower back", "Intake pending"],
    status: "new",
    nextAppointment: "Today · 11:30",
    lastSession: "New client",
    stats: {
      recoveryScore: 0,
      scoreDelta: "—",
      rangeOfMotion: "—",
      romDelta: "—",
      asymmetry: "—",
      asymmetryDelta: "—",
      sessionsCompleted: 0,
      sessionsPlanned: 10,
      adherence: 0,
      goalDate: "TBD",
    },
    trend: [],
    sessions: [],
    goals: [
      { label: "Complete baseline assessment", progress: 0 },
      { label: "Reduce lumbar pain VAS below 4", progress: 0 },
    ],
    flag: "Intake form not yet completed. Collect history before first scan.",
  },
  {
    id: "sofia-alvarez",
    name: "Sofia Alvarez",
    age: 52,
    sex: "Female",
    email: "sofia.alvarez@mail.co",
    phone: "+1 (305) 555-0155",
    focus: "Post-surgical knee",
    referredBy: "Dr. Huang",
    tags: ["Post-surgical", "Knee"],
    status: "active",
    nextAppointment: "Today · 13:00",
    lastSession: "6 days ago",
    stats: {
      recoveryScore: 71,
      scoreDelta: "+5",
      rangeOfMotion: "112°",
      romDelta: "+8°",
      asymmetry: "9%",
      asymmetryDelta: "-2%",
      sessionsCompleted: 11,
      sessionsPlanned: 20,
      adherence: 88,
      goalDate: "Jul 02, 2026",
    },
    trend: [
      { label: "W1", score: 46, baseline: 58 },
      { label: "W2", score: 52, baseline: 60 },
      { label: "W3", score: 58, baseline: 62 },
      { label: "W4", score: 62, baseline: 64 },
      { label: "W5", score: 65, baseline: 66 },
      { label: "W6", score: 68, baseline: 68 },
      { label: "W7", score: 70, baseline: 70 },
      { label: "W8", score: 71, baseline: 72 },
    ],
    sessions: [
      {
        date: "Apr 12",
        protocol: "H3-Alpha · 22 min",
        score: 71,
        delta: "+2",
        notes: "Knee extension improving. Quad activation still weak.",
      },
      {
        date: "Apr 05",
        protocol: "H3-Alpha · 22 min",
        score: 69,
        delta: "+3",
        notes: "Tolerated higher intensity. Swelling minimal.",
      },
    ],
    goals: [
      { label: "Achieve full knee extension", progress: 62 },
      { label: "Return to stair climb unaided", progress: 48 },
    ],
  },
  {
    id: "amira-hassan",
    name: "Amira Hassan",
    age: 27,
    sex: "Female",
    email: "amira.hassan@mail.co",
    phone: "+1 (646) 555-0133",
    focus: "Athlete maintenance",
    referredBy: "Team physio",
    tags: ["Athlete", "Maintenance"],
    status: "maintenance",
    nextAppointment: "Next week",
    lastSession: "2 days ago",
    stats: {
      recoveryScore: 91,
      scoreDelta: "+9",
      rangeOfMotion: "160°",
      romDelta: "+2°",
      asymmetry: "2%",
      asymmetryDelta: "0%",
      sessionsCompleted: 14,
      sessionsPlanned: 16,
      adherence: 100,
      goalDate: "Ongoing",
    },
    trend: [
      { label: "W1", score: 82, baseline: 70 },
      { label: "W2", score: 84, baseline: 70 },
      { label: "W3", score: 85, baseline: 70 },
      { label: "W4", score: 87, baseline: 71 },
      { label: "W5", score: 88, baseline: 71 },
      { label: "W6", score: 89, baseline: 72 },
      { label: "W7", score: 90, baseline: 72 },
      { label: "W8", score: 91, baseline: 72 },
    ],
    sessions: [
      {
        date: "Apr 16",
        protocol: "H3-Gamma · 14 min",
        score: 91,
        delta: "+1",
        notes: "Peak readiness. Symmetry and ROM within elite range.",
      },
      {
        date: "Apr 09",
        protocol: "H3-Gamma · 14 min",
        score: 90,
        delta: "+2",
        notes: "Excellent HRV recovery between training blocks.",
      },
    ],
    goals: [
      { label: "Maintain recovery score > 88", progress: 96 },
      { label: "Keep asymmetry under 3%", progress: 92 },
    ],
  },
  {
    id: "tomas-oliveira",
    name: "Tomás Oliveira",
    age: 45,
    sex: "Male",
    email: "tomas.oliveira@mail.co",
    phone: "+1 (718) 555-0164",
    focus: "Cervical · Desk worker",
    referredBy: "Self-referred",
    tags: ["Cervical", "Desk worker"],
    status: "active",
    nextAppointment: "Fri · 15:30",
    lastSession: "4 days ago",
    stats: {
      recoveryScore: 72,
      scoreDelta: "+2",
      rangeOfMotion: "78°",
      romDelta: "+6°",
      asymmetry: "6%",
      asymmetryDelta: "-1%",
      sessionsCompleted: 7,
      sessionsPlanned: 14,
      adherence: 84,
      goalDate: "Jun 28, 2026",
    },
    trend: [
      { label: "W1", score: 60, baseline: 62 },
      { label: "W2", score: 63, baseline: 63 },
      { label: "W3", score: 65, baseline: 64 },
      { label: "W4", score: 67, baseline: 65 },
      { label: "W5", score: 69, baseline: 66 },
      { label: "W6", score: 70, baseline: 67 },
      { label: "W7", score: 71, baseline: 68 },
      { label: "W8", score: 72, baseline: 68 },
    ],
    sessions: [
      {
        date: "Apr 14",
        protocol: "H3-Beta · 18 min",
        score: 72,
        delta: "+1",
        notes: "Cervical rotation improving. Breath pattern still shallow.",
      },
      {
        date: "Apr 07",
        protocol: "H3-Beta · 18 min",
        score: 71,
        delta: "+2",
        notes: "Postural hold time up 20%.",
      },
    ],
    goals: [
      { label: "Cervical rotation > 85°", progress: 68 },
      { label: "Daily mobility routine adherence", progress: 72 },
    ],
  },
  {
    id: "jordan-reyes",
    name: "Jordan Reyes",
    age: 38,
    sex: "Non-binary",
    email: "jordan.reyes@mail.co",
    phone: "+1 (503) 555-0188",
    focus: "Cervical mobility reassessment",
    referredBy: "Dr. Okafor",
    tags: ["Cervical mobility"],
    status: "paused",
    nextAppointment: "Today · 14:30",
    lastSession: "1 week ago",
    stats: {
      recoveryScore: 74,
      scoreDelta: "0",
      rangeOfMotion: "82°",
      romDelta: "0°",
      asymmetry: "7%",
      asymmetryDelta: "0%",
      sessionsCompleted: 6,
      sessionsPlanned: 12,
      adherence: 72,
      goalDate: "Jul 10, 2026",
    },
    trend: [
      { label: "W1", score: 62, baseline: 62 },
      { label: "W2", score: 66, baseline: 64 },
      { label: "W3", score: 70, baseline: 65 },
      { label: "W4", score: 73, baseline: 66 },
      { label: "W5", score: 74, baseline: 68 },
      { label: "W6", score: 74, baseline: 69 },
      { label: "W7", score: 74, baseline: 70 },
      { label: "W8", score: 74, baseline: 70 },
    ],
    sessions: [
      {
        date: "Apr 11",
        protocol: "H3-Alpha · 22 min",
        score: 74,
        delta: "0",
        notes: "Plateau across last two sessions. Consider protocol change.",
      },
    ],
    goals: [
      { label: "Restore cervical ROM > 90°", progress: 58 },
      { label: "Weekly attendance", progress: 72 },
    ],
    flag: "Recovery has plateaued for 2 sessions. Review protocol selection.",
  },
]

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id)
}
