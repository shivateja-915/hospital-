import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Search, CalendarDays, User, Clock, CheckCircle, XCircle, Star } from "lucide-react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default async function PatientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user?.id)
    .single()

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user?.id)
    .single()

  // Generate Stats
  const { count: totalBooked } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("patient_id", patient?.id)

  const { count: totalCompleted } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("patient_id", patient?.id)
    .eq("status", "completed")

  const { count: totalPending } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("patient_id", patient?.id)
    .eq("status", "pending")

  const { count: totalReviews } = await supabase
    .from("reviews")
    .select('*', { count: 'exact', head: true })
    .eq("patient_id", patient?.id)

  // Fetch upcoming appointments (strictly pending/confirmed)
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        specialization,
        users!inner ( full_name )
      )
    `)
    .eq("patient_id", patient?.id)
    .neq("status", "completed")
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .limit(5)

  // Fetch rejected/cancelled appointments separately
  const { data: rejectedAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        specialization,
        users!inner ( full_name )
      )
    `)
    .eq("patient_id", patient?.id)
    .eq("status", "cancelled")
    .order("appointment_date", { ascending: false })
    .limit(3)

  // Fetch recent reviews given by the patient
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      doctors (
        users!inner ( full_name ),
        specialization
      )
    `)
    .eq("patient_id", patient?.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const greeting = getGreeting()
  const firstName = userData?.full_name?.split(' ')[0] || 'Guest'

  return (
    <div className="space-y-8">
      {/* Idea 1: Greeting & Idea 2: Health Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manrope text-4xl font-bold tracking-tight text-on-surface">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-on-surface-variant font-inter mt-1">How are you feeling today?</p>
        </div>
        
        {patient && (
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/15 text-xs sm:text-sm font-medium text-on-surface text-center overflow-x-auto whitespace-nowrap w-full md:w-auto">
             <span>🩸 Blood Group: {patient.blood_group || 'N/A'}</span>
             <span className="text-outline-variant">|</span>
             <span>👤 Age: {patient.age || 'N/A'}</span>
             <span className="text-outline-variant">|</span>
             <span>📞 {patient.phone || 'No phone'}</span>
          </div>
        )}
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Booked</p>
            <p className="text-3xl font-bold text-primary">{totalBooked || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Completed</p>
            <p className="text-3xl font-bold text-success">{totalCompleted || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Pending</p>
            <p className="text-3xl font-bold text-warning">{totalPending || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Reviews</p>
            <p className="text-3xl font-bold text-secondary">{totalReviews || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Row 2: Upcoming Appointments Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="font-manrope text-2xl font-bold text-on-surface">Upcoming Appointments</h2>
            
            <Card>
              <CardContent className="p-6">
                {upcomingAppointments && upcomingAppointments.length > 0 ? (
                  <div className="space-y-6">
                    {upcomingAppointments.map((apt, idx) => {
                      const isLast = idx === upcomingAppointments.length - 1;
                      const statusColor = 
                        apt.status === 'confirmed' ? 'bg-success' : 'bg-warning';
                      
                      return (
                        <div key={apt.id} className="relative flex gap-6">
                           {/* Timeline Line */}
                           {!isLast && (
                             <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-outline-variant/30" />
                           )}
                           {/* Timeline Dot */}
                           <div className="relative z-10 w-6 h-6 rounded-full bg-surface flex items-center justify-center border-2 border-surface mt-1 shrink-0">
                             <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                           </div>
                           
                           {/* Card Content */}
                           <div className="flex-1 bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 hover:border-primary/30 transition-colors">
                             <div className="flex justify-between items-start flex-wrap gap-2">
                               <div>
                                  <h3 className="font-bold text-lg text-on-surface">Dr. {apt.doctors?.users?.full_name}</h3>
                                  <p className="text-sm text-primary font-medium">{apt.doctors?.specialization}</p>
                               </div>
                               <div className="text-right">
                                  <span className="inline-flex items-center gap-1 text-sm font-semibold bg-surface-container-highest px-3 py-1 rounded-full text-on-surface">
                                    <Clock className="w-4 h-4" /> {apt.appointment_time}
                                  </span>
                               </div>
                             </div>
                             <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-sm">
                               <div className="flex gap-4">
                                 <p className="text-on-surface-variant font-medium">{apt.appointment_date}</p>
                                 <span className="capitalize text-on-surface-variant">• {apt.status}</span>
                               </div>
                               {apt.status === 'confirmed' && (
                                 <CheckCircle className="w-5 h-5 text-success" />
                               )}
                             </div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-2">No appointments yet</h3>
                    <p className="text-on-surface-variant max-w-sm mx-auto mb-6">
                      You don't have any upcoming visits scheduled. Book a consultation with one of our specialists.
                    </p>
                    <Button asChild>
                       <Link href="/patient/doctors">Book Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Section: Rejected Appointments */}
          {rejectedAppointments && rejectedAppointments.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-manrope text-2xl font-bold text-error">Rejected Appointments</h2>
              <div className="grid gap-3">
                {rejectedAppointments.map((apt) => (
                  <Card key={apt.id} className="bg-error/5 border-error/10 hover:bg-error/10 transition-colors">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-error/20 text-error flex items-center justify-center font-bold">
                           {apt.doctors?.users?.full_name?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-on-surface">Dr. {apt.doctors?.users?.full_name}</p>
                           <p className="text-sm text-on-surface-variant">{apt.doctors?.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm font-medium">
                           <p className="text-on-surface">{apt.appointment_date}</p>
                           <p className="text-on-surface-variant text-right">{apt.appointment_time}</p>
                        </div>
                        <XCircle className="w-6 h-6 text-error opacity-70" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-manrope text-2xl font-bold text-on-surface">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
             <Link href="/patient/doctors" className="group flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="w-12 h-12 bg-primary-fixed text-on-primary-fixed rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-on-surface">Find a Doctor</h3>
                   <p className="text-sm text-on-surface-variant">Browse specialists & book</p>
                </div>
             </Link>

             <Link href="/patient/appointments" className="group flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 hover:border-secondary/40 hover:bg-secondary/5 transition-all">
                <div className="w-12 h-12 bg-secondary-fixed text-on-secondary-fixed rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-on-surface">My Appointments</h3>
                   <p className="text-sm text-on-surface-variant">View all history</p>
                </div>
             </Link>

             {/* Placeholder for Profile Editing (optional feature) */}
             <div className="group flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 hover:border-tertiary/40 hover:bg-tertiary/5 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-on-surface">Edit Profile</h3>
                   <p className="text-sm text-on-surface-variant">Update health details</p>
                </div>
             </div>
          </div>
          
          {/* Idea 4: Recent Reviews History */}
          <div className="space-y-4 pt-4">
             <h2 className="font-manrope text-2xl font-bold text-on-surface">Your Recent Reviews</h2>
             {recentReviews && recentReviews.length > 0 ? (
               <div className="space-y-3">
                 {recentReviews.map((rev) => (
                   <Card key={rev.id} className="bg-success-container/5 border-success/10 shadow-none hover:bg-success/5 transition-all">
                      <CardContent className="p-4">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <p className="font-bold text-on-surface text-sm">Dr. {rev.doctors?.users?.full_name}</p>
                               <div className="flex gap-0.5">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-warning text-warning' : 'text-outline-variant'}`} />
                                 ))}
                               </div>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase">{new Date(rev.created_at).toLocaleDateString()}</span>
                         </div>
                         <p className="text-xs text-on-surface-variant italic line-clamp-2">"{rev.comment}"</p>
                      </CardContent>
                   </Card>
                 ))}
                 <Link href="/patient/appointments" className="text-xs font-bold text-primary hover:underline flex justify-center mt-2 capitalize tracking-widest">View all history</Link>
               </div>
             ) : (
               <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl">
                  <p className="text-xs text-on-surface-variant font-medium">No reviews given yet.</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
