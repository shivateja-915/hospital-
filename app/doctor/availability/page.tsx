import { createClient } from "@/utils/supabase/server"
import ScheduleManager from "./ScheduleManager"

export default async function DoctorAvailability() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("user_id", user?.id)
    .single()

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("doctor_id", doctor?.id)
    .order("day_of_week")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Weekly Schedule</h1>
        <p className="text-on-surface-variant font-inter">Manage your available hours for patients.</p>
      </div>

      <ScheduleManager doctorId={doctor?.id} initialSlots={availability || []} />
    </div>
  )
}
