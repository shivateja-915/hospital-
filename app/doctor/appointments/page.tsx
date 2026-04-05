import { createClient } from "@/utils/supabase/server"
import AppointmentsManager from "./AppointmentsManager"

export default async function DoctorAppointments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("user_id", user?.id)
    .single()

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      patients (
        id,
        user_id,
        users ( full_name )
      )
    `)
    .eq("doctor_id", doctor?.id)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Manage Appointments</h1>
        <p className="text-on-surface-variant font-inter">Accept, reject, or mark as completed.</p>
      </div>

      <AppointmentsManager initialAppointments={appointments || []} />
    </div>
  )
}
