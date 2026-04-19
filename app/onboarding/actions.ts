"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"
import { PRACTITIONER_TITLES, CLINIC_TYPES } from "./constants"

const AccountInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  title: z.enum(PRACTITIONER_TITLES),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
})

const CertificationSchema = z.object({
  name: z.string().trim().min(1, "Certification name is required").max(200),
  issuingOrg: z.string().trim().min(1, "Issuing organization is required").max(200),
  issueDate: z.string().optional().or(z.literal("")),
  expirationDate: z.string().optional().or(z.literal("")),
})

const CreateClinicSchema = z.object({
  name: z.string().trim().min(1, "Clinic name is required").max(200),
  clinicType: z.enum(["pt_chiro", "sports_rehab", "athletic_center"]),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
})

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

// =============================================================
// Step 1 — submit account info (creates/updates the practitioner row)
// =============================================================

export async function submitAccountInfo(
  input: z.infer<typeof AccountInfoSchema>,
): Promise<ActionResult<{ practitionerId: string }>> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: "Not signed in." }

  const parsed = AccountInfoSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message
    }
    return { ok: false, error: "Invalid input.", fieldErrors }
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null

  const supabase = createAdminSupabaseClient()
  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim()

  // Upsert by clerk_user_id — idempotent if the user backs up and re-submits.
  const { data, error } = await supabase
    .from("practitioners")
    .upsert(
      {
        clerk_user_id: userId,
        full_name: fullName,
        title: parsed.data.title,
        email,
        // phone intentionally not in the schema yet (we can add a column later)
      },
      { onConflict: "clerk_user_id" },
    )
    .select("id")
    .single()

  if (error) {
    console.error("[submitAccountInfo] supabase error:", error)
    return { ok: false, error: "Could not save your account info." }
  }

  revalidatePath("/onboarding")
  return { ok: true, data: { practitionerId: data.id } }
}

// =============================================================
// Step 2 — certifications
// =============================================================

export async function addCertification(
  formData: FormData,
): Promise<ActionResult<{ certificationId: string }>> {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner) {
    return { ok: false, error: "Complete step 1 first." }
  }

  const parsed = CertificationSchema.safeParse({
    name: formData.get("name"),
    issuingOrg: formData.get("issuingOrg"),
    issueDate: formData.get("issueDate"),
    expirationDate: formData.get("expirationDate"),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message
    }
    return { ok: false, error: "Invalid input.", fieldErrors }
  }

  const supabase = createAdminSupabaseClient()

  // Handle optional file
  const file = formData.get("file") as File | null
  let filePath: string | null = null
  let fileName: string | null = null
  let fileSize: number | null = null

  if (file && file.size > 0) {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"]
    if (!allowedTypes.includes(file.type)) {
      return { ok: false, error: "Only PDF, PNG, and JPG files are allowed." }
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: "File must be under 10 MB." }
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const certId = crypto.randomUUID()
    const path = `${practitioner.id}/${certId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("certifications")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[addCertification] upload error:", uploadError)
      return {
        ok: false,
        error:
          "Could not upload the file. Make sure the 'certifications' storage bucket exists.",
      }
    }

    filePath = path
    fileName = file.name
    fileSize = file.size
  }

  const { data, error } = await supabase
    .from("certifications")
    .insert({
      practitioner_id: practitioner.id,
      name: parsed.data.name,
      issuing_org: parsed.data.issuingOrg,
      issue_date: parsed.data.issueDate || null,
      expiration_date: parsed.data.expirationDate || null,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[addCertification] supabase error:", error)
    // If the DB insert fails but we already uploaded the file, best-effort cleanup
    if (filePath) {
      await supabase.storage.from("certifications").remove([filePath])
    }
    return { ok: false, error: "Could not save the certification." }
  }

  revalidatePath("/onboarding/credentials")
  return { ok: true, data: { certificationId: data.id } }
}

export async function removeCertification(
  certificationId: string,
): Promise<ActionResult> {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner) return { ok: false, error: "Not signed in." }

  const supabase = createAdminSupabaseClient()

  // Lookup so we can delete the file too, and confirm ownership.
  const { data: cert } = await supabase
    .from("certifications")
    .select("id, practitioner_id, file_path")
    .eq("id", certificationId)
    .maybeSingle()

  if (!cert || cert.practitioner_id !== practitioner.id) {
    return { ok: false, error: "Certification not found." }
  }

  if (cert.file_path) {
    await supabase.storage.from("certifications").remove([cert.file_path])
  }

  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", certificationId)

  if (error) {
    console.error("[removeCertification] supabase error:", error)
    return { ok: false, error: "Could not remove the certification." }
  }

  revalidatePath("/onboarding/credentials")
  return { ok: true, data: undefined }
}

export async function listCertifications() {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner) return []

  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from("certifications")
    .select("id, name, issuing_org, issue_date, expiration_date, file_name, file_size, created_at")
    .eq("practitioner_id", practitioner.id)
    .order("created_at", { ascending: false })

  return data ?? []
}

// =============================================================
// Step 3 — workplace
// =============================================================

export async function searchClinicsByType(
  clinicType: string,
  query: string,
): Promise<
  Array<{
    id: string
    name: string
    clinic_type: string
    address: string | null
    practitioner_count: number
  }>
> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.rpc("search_clinics_by_type", {
    q: query ?? "",
    c_type: clinicType,
  })
  if (error) {
    console.error("[searchClinicsByType] rpc error:", error)
    return []
  }
  return (data ?? []).map((r: {
    id: string
    name: string
    clinic_type: string
    address: string | null
    practitioner_count: number | string
  }) => ({
    ...r,
    practitioner_count: Number(r.practitioner_count),
  }))
}

export async function createClinic(
  input: z.infer<typeof CreateClinicSchema>,
): Promise<ActionResult<{ clinicId: string }>> {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner) {
    return { ok: false, error: "Complete step 1 first." }
  }

  const parsed = CreateClinicSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message
    }
    return { ok: false, error: "Invalid input.", fieldErrors }
  }

  const supabase = createAdminSupabaseClient()

  // Create clinic
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .insert({
      name: parsed.data.name,
      clinic_type: parsed.data.clinicType,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .select("id")
    .single()

  if (clinicError || !clinic) {
    console.error("[createClinic] insert error:", clinicError)
    return { ok: false, error: "Could not create the clinic." }
  }

  // Attach practitioner to the new clinic
  const { error: updateError } = await supabase
    .from("practitioners")
    .update({ clinic_id: clinic.id })
    .eq("id", practitioner.id)

  if (updateError) {
    console.error("[createClinic] practitioner update error:", updateError)
    await supabase.from("clinics").delete().eq("id", clinic.id)
    return { ok: false, error: "Could not attach you to the clinic." }
  }

  revalidatePath("/onboarding")
  return { ok: true, data: { clinicId: clinic.id } }
}

export async function requestJoinClinic(
  clinicId: string,
): Promise<ActionResult> {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner) {
    return { ok: false, error: "Complete step 1 first." }
  }
  if (!clinicId) return { ok: false, error: "Missing clinic id." }

  const supabase = createAdminSupabaseClient()

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id")
    .eq("id", clinicId)
    .maybeSingle()

  if (!clinic) return { ok: false, error: "Clinic not found." }

  const { error } = await supabase
    .from("practitioners")
    .update({ clinic_id: clinic.id })
    .eq("id", practitioner.id)

  if (error) {
    console.error("[requestJoinClinic] update error:", error)
    return { ok: false, error: "Could not join the clinic." }
  }

  revalidatePath("/onboarding")
  return { ok: true, data: undefined }
}

// =============================================================
// Completion — just a nav helper
// =============================================================

export async function finishOnboarding() {
  redirect("/dashboard")
}
