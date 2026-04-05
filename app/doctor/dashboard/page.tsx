import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, Clock, Settings, UserCircle, Star } from "lucide-react"
import OnlineToggle from "./OnlineToggle"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function DoctorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user?.id)
    .single()

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("user_id", user?.id)
    .single()

  const todayStr = getTodayString()

  // Get total UPCOMING appointments (confirmed/pending for today onwards)
  const { count: totalUpcoming } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("doctor_id", doctor?.id)
    .gte("appointment_date", todayStr)
    .neq("status", "completed")
    .neq("status", "cancelled")

  const { count: pendingRequests } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("doctor_id", doctor?.id)
    .eq("status", "pending")

  const { count: totalCompleted } = await supabase
    .from("appointments")
    .select('*', { count: 'exact', head: true })
    .eq("doctor_id", doctor?.id)
    .eq("status", "completed")

  // Average Rating
  const { data: allRatingReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("doctor_id", doctor?.id)
  
  const avgRating = allRatingReviews && allRatingReviews.length > 0 
    ? (allRatingReviews.reduce((acc, r) => acc + r.rating, 0) / allRatingReviews.length).toFixed(1) 
    : '0.0'

  // Fetch recent reviews with patient details
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      patients (
        users ( full_name )
      )
    `)
    .eq("doctor_id", doctor?.id)
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch UPCOMING appointments for the list (today and future, strictly active)
  const { data: upcomingList } = await supabase
    .from("appointments")
    .select(`
      *,
      patients!inner (
        id,
        users!inner ( full_name )
      )
    `)
    .eq("doctor_id", doctor?.id)
    .gte("appointment_date", todayStr)
    .neq("status", "completed")
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })
    .limit(10)

  const greeting = getGreeting()
  // Clean "Dr. " prefix if it already exists in the name to prevent "Dr. Dr. name"
  const rawName = userData?.full_name || 'Doctor'
  const cleanName = rawName.replace(/^Dr\.\s*/i, '')

  return (
    <div className="space-y-8">
      {/* Greeting and Online Toggle */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="font-manrope text-4xl font-bold tracking-tight text-on-surface">
            {greeting}, Dr. {cleanName}! 👋
          </h1>
          <p className="text-on-surface-variant font-inter mt-1">Here's your overview for today.</p>
        </div>
        
        {doctor && (
          <div className="w-full md:w-auto md:min-w-[320px]">
             <OnlineToggle initialIsOnline={doctor.is_online} doctorId={doctor.id} />
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Upcoming Appointments</p>
            <p className="text-3xl font-bold text-primary">{totalUpcoming || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-warning">{pendingRequests || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Total Completed</p>
            <p className="text-3xl font-bold text-success">{totalCompleted || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/10 shadow-none">
           <CardContent className="p-6">
            <p className="text-sm font-medium text-on-surface-variant mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-secondary flex items-center gap-2">
               {avgRating} <Star className="w-5 h-5 fill-secondary" />
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-center">
             <h2 className="font-manrope text-2xl font-bold text-on-surface">Upcoming Appointments</h2>
             <Button variant="outline" asChild size="sm">
               <Link href="/doctor/appointments">View All</Link>
             </Button>
           </div>
          
          <Card>
            <CardContent className="p-6">
              {upcomingList && upcomingList.length > 0 ? (
                <div className="space-y-4">
                  {upcomingList.map((apt) => {
                    const statusColor = 
                      apt.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 
                      'bg-warning/10 text-warning border-warning/20';
                      
                    const dotColor = 
                      apt.status === 'confirmed' ? 'bg-success' : 
                      'bg-warning';
                    
                    return (
                      <div key={apt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center">
                               {apt.patients?.users?.full_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                               <p className="font-bold text-on-surface">{apt.patients?.users?.full_name}</p>
                               <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                 <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {apt.appointment_date}</span>
                                 <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {apt.appointment_time}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 capitalize ${statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                              {apt.status}
                            </span>
                         </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">No upcoming appointments</h3>
                  <p className="text-on-surface-variant max-w-sm mx-auto">
                    Check your pending requests to accept new bookings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-manrope text-2xl font-bold text-on-surface">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
             <Link href="/doctor/appointments" className="group flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 hover:border-secondary/40 hover:bg-secondary/5 transition-all">
                <div className="w-12 h-12 bg-secondary-fixed text-on-secondary-fixed rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                   <Calendar className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-on-surface">All Appointments</h3>
                   <p className="text-sm text-on-surface-variant">View and filter requests</p>
                </div>
             </Link>

             <div className="group flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 hover:border-tertiary/40 hover:bg-tertiary/5 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                   <UserCircle className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-on-surface">Edit Profile</h3>
                   <p className="text-sm text-on-surface-variant">Update bio & fees</p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Recent Patient Reviews with Float Animation */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="font-manrope text-2xl font-bold text-on-surface">Patient Feedback</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                 <Star className="w-4 h-4 fill-secondary text-secondary" />
                 <span className="text-sm font-bold text-secondary">{avgRating} Avg Rating</span>
              </div>
           </div>
           
           {recentReviews && recentReviews.length > 0 ? (
             <div className="grid grid-cols-1 gap-4">
               {recentReviews.map((rev, idx) => (
                 <div 
                   key={rev.id} 
                   className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                   style={{ animationDelay: `${idx * 150}ms` }}
                 >
                   <Card className="hover:shadow-lg transition-all duration-300 border-outline-variant/10 group overflow-hidden bg-surface-container-lowest">
                      <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                 {rev.patients?.users?.full_name?.charAt(0) || 'P'}
                               </div>
                               <div>
                                  <p className="font-bold text-on-surface">{rev.patients?.users?.full_name}</p>
                                  <div className="flex gap-0.5 mt-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? 'fill-warning text-warning' : 'text-outline-variant'}`} />
                                    ))}
                                  </div>
                               </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                               {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                         </div>
                         <p className="text-sm text-on-surface-variant italic leading-relaxed relative pl-4 border-l-2 border-primary/20">
                            "{rev.comment}"
                         </p>
                      </CardContent>
                   </Card>
                 </div>
               ))}
             </div>
           ) : (
             <div className="p-12 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20 italic text-on-surface-variant">
                No reviews received yet.
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
