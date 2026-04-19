import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const PRACTITIONER_CLERK_ID = "user_seed_practitioner_001"

const PROTOCOLS = [
  "Signature Short",
  "HydraFlush",
  "Precision Dilation",
  "Mobility Surge",
  "Deep Session",
]

export async function seedMockData() {
  const supabase = createAdminSupabaseClient()

  // 1. Create clinic
  const { data: clinic, error: clinicErr } = await supabase
    .from("clinics")
    .upsert(
      { name: "Hydrawav3 Wellness Studio", clinic_type: "sports_rehab" },
      { onConflict: "name" },
    )
    .select("id")
    .single()

  if (clinicErr) throw new Error(`Clinic: ${clinicErr.message}`)

  // 2. Create practitioner
  const { data: practitioner, error: pracErr } = await supabase
    .from("practitioners")
    .upsert(
      {
        clerk_user_id: PRACTITIONER_CLERK_ID,
        clinic_id: clinic.id,
        full_name: "Alex Rivera",
        title: "Recovery Specialist",
        email: "alex@hydrawav3.com",
      },
      { onConflict: "clerk_user_id" },
    )
    .select("id")
    .single()

  if (pracErr) throw new Error(`Practitioner: ${pracErr.message}`)

  // 3. Create patients
  const patientDefs = [
    {
      full_name: "Maria Santos",
      dob: "1984-03-12",
      email: "maria.santos@example.com",
      phone: "+1 (415) 555-0201",
      focus_region: "right hip",
      intake: { notes: "Marathon runner, chronic right hip tightness, high weekly mileage" },
    },
    {
      full_name: "James Chen",
      dob: "1991-07-28",
      email: "james.chen@example.com",
      phone: "+1 (628) 555-0192",
      focus_region: "lower back",
      intake: { notes: "Desk worker, lower back and neck tension from prolonged sitting" },
    },
    {
      full_name: "Sofia Kowalski",
      dob: "1998-11-05",
      email: "sofia.kowalski@example.com",
      phone: "+1 (212) 555-0177",
      focus_region: "shoulder",
      intake: { notes: "CrossFit athlete, post-workout shoulder recovery, high training volume" },
    },
  ]

  const patientIds: string[] = []

  for (const p of patientDefs) {
    const { data, error } = await supabase
      .from("patients")
      .upsert(
        { ...p, clinic_id: clinic.id, primary_practitioner_id: practitioner.id },
        { onConflict: "email" },
      )
      .select("id")
      .single()

    if (error) throw new Error(`Patient ${p.full_name}: ${error.message}`)
    patientIds.push(data.id)
  }

  // 4. Create 2 past sessions per patient
  const sessionTemplates = [
    [
      {
        protocol: "Mobility Surge",
        notes_final: "Good ROM improvement. Asymmetry reduced by 8%. Client reported feeling looser post-session.",
        daysAgo: 14,
      },
      {
        protocol: "HydraFlush",
        notes_final: "Focused on recovery signals. HRV trending upward. Recommended reduced training load.",
        daysAgo: 7,
      },
    ],
    [
      {
        protocol: "Precision Dilation",
        notes_final: "Lower back mobility improved. Recommended ergonomic adjustments between sessions.",
        daysAgo: 12,
      },
      {
        protocol: "Signature Short",
        notes_final: "Cervical tension addressed. Neck rotation improved from 60° to 72°.",
        daysAgo: 5,
      },
    ],
    [
      {
        protocol: "Deep Session",
        notes_final: "Post-WOD shoulder flush. Inflammation markers down. Full ROM restored on overhead press.",
        daysAgo: 10,
      },
      {
        protocol: "Mobility Surge",
        notes_final: "Maintained shoulder mobility gains. Activation drills added to protocol.",
        daysAgo: 3,
      },
    ],
  ]

  for (let i = 0; i < patientIds.length; i++) {
    const patientId = patientIds[i]
    const sessions = sessionTemplates[i]

    for (const s of sessions) {
      const startedAt = new Date()
      startedAt.setDate(startedAt.getDate() - s.daysAgo)
      const endedAt = new Date(startedAt.getTime() + 25 * 60 * 1000) // +25 min

      await supabase.from("sessions").insert({
        patient_id: patientId,
        practitioner_id: practitioner.id,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        protocol: s.protocol,
        notes_final: s.notes_final,
      })
    }
  }

  // 5. Create 1 assessment per patient with wearable + ROM data
  const assessmentTemplates = [
    {
      primary_area: "right hip",
      secondary_areas: ["lower back", "calf"],
      wellness_goals: ["mobility", "recovery", "performance"],
      reported_discomfort_level: 5,
      mobility_restrictions: "Limited internal rotation right hip, tightness in ITB",
      recent_activity_level: "high",
      last_session_feedback: "Felt better for 3 days after last session, stiffness returned before long run",
      wearable_data: { hrv_rmssd: 58, strain: 14.2, sleep_score: 72, recovery_score: 64 },
      rom_data: [
        { location: "right hip internal rotation", degrees: 28, asymmetry_flag: true },
        { location: "left hip internal rotation", degrees: 42, asymmetry_flag: false },
      ],
    },
    {
      primary_area: "lower back",
      secondary_areas: ["neck", "upper back"],
      wellness_goals: ["mobility", "relaxation"],
      reported_discomfort_level: 6,
      mobility_restrictions: "Reduced lumbar flexion, cervical lateral bend restricted bilaterally",
      recent_activity_level: "low",
      last_session_feedback: "Significant relief post-session, discomfort returns after 6+ hours at desk",
      wearable_data: { hrv_rmssd: 42, strain: 8.1, sleep_score: 61, recovery_score: 48 },
      rom_data: [
        { location: "lumbar flexion", degrees: 42, asymmetry_flag: false },
        { location: "cervical lateral bend right", degrees: 28, asymmetry_flag: true },
        { location: "cervical lateral bend left", degrees: 38, asymmetry_flag: false },
      ],
    },
    {
      primary_area: "shoulder",
      secondary_areas: ["upper back", "neck"],
      wellness_goals: ["recovery", "performance", "activation"],
      reported_discomfort_level: 4,
      mobility_restrictions: "Mild impingement on overhead press, slight asymmetry in external rotation",
      recent_activity_level: "very_high",
      last_session_feedback: "Felt primed for competition after last protocol. Want to maintain gains",
      wearable_data: { hrv_rmssd: 78, strain: 18.6, sleep_score: 84, recovery_score: 79 },
      rom_data: [
        { location: "right shoulder external rotation", degrees: 88, asymmetry_flag: true },
        { location: "left shoulder external rotation", degrees: 96, asymmetry_flag: false },
        { location: "bilateral overhead elevation", degrees: 172, asymmetry_flag: false },
      ],
    },
  ]

  for (let i = 0; i < patientIds.length; i++) {
    await supabase.from("assessments").insert({
      patient_id: patientIds[i],
      practitioner_id: practitioner.id,
      ...assessmentTemplates[i],
    })
  }

  return {
    clinicId: clinic.id,
    practitionerId: practitioner.id,
    patientIds,
    message: "Seed complete: 1 clinic, 1 practitioner, 3 patients, 6 sessions, 3 assessments",
  }
}
