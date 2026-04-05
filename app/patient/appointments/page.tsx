import { createClient } from "@/utils/supabase/server"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Star, MessageSquare } from "lucide-react"
import ReviewForm from "./ReviewForm"

export default async function PatientAppointments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user?.id)
    .single()

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        user_id,
        specialization,
        users ( full_name )
      ),
      reviews (
        id,
        rating,
        comment
      )
    `)
    .eq("patient_id", patient?.id)
    .order("appointment_date", { ascending: false })

  const activeAppointments = appointments?.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled') || []
  const finishedAppointments = appointments?.filter(apt => apt.status === 'completed') || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">My Appointments</h1>
        <p className="text-on-surface-variant font-inter">View and manage your scheduled consultations.</p>
      </div>

      <div className="space-y-6">
        {/* Active Appointments */}
        <div className="space-y-4">
          <h2 className="font-manrope text-2xl font-bold text-on-surface flex items-center gap-2">
             <Calendar className="w-5 h-5 text-primary" /> Active Appointments
          </h2>
          {activeAppointments.length > 0 ? (
            activeAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg uppercase transition-transform hover:scale-105">
                      {(apt.doctors?.users?.full_name || 'D').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-on-surface leading-tight">Dr. {apt.doctors?.users?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-primary font-medium">{apt.doctors?.specialization || 'General Specialist'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 flex-wrap items-center">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 font-bold text-on-surface text-sm">
                        <Calendar className="w-4 h-4 opacity-70" /> {apt.appointment_date}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                        <Clock className="w-4 h-4 opacity-70" /> {apt.appointment_time}
                      </p>
                    </div>
                    <div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm border ${
                        apt.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 
                        apt.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : 
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 bg-transparent shadow-none">
              <CardContent className="p-12 text-center">
                <p className="text-on-surface-variant/60 font-medium">No upcoming appointments.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Finished Appointments */}
        <div className="space-y-4">
          <h2 className="font-manrope text-2xl font-bold text-on-surface flex items-center gap-2">
             <Star className="w-5 h-5 text-success" /> Completed Visits
          </h2>
          {finishedAppointments.length > 0 ? (
            finishedAppointments.map((apt) => (
              <Card key={apt.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low/50">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg uppercase">
                        {(apt.doctors?.users?.full_name || 'D').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-on-surface">Dr. {apt.doctors?.users?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-on-surface-variant underline decoration-secondary/30">{apt.doctors?.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                       <div className="text-right">
                          <p className="text-sm font-bold text-on-surface opacity-60 line-through decoration-error/20">{apt.appointment_date}</p>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-full">
                            Consultation Finished
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                      {/* Review Section */}
                      {apt.reviews && apt.reviews.length > 0 ? (
                         <div className="mt-4 p-4 bg-success/5 border border-success/10 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                               <div className="flex gap-1">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} className={`w-4 h-4 ${i < apt.reviews[0].rating ? 'fill-warning text-warning' : 'text-outline-variant'}`} />
                                 ))}
                               </div>
                               <span className="text-xs font-bold text-success uppercase tracking-widest bg-success/10 px-2 py-0.5 rounded">Reviewed</span>
                            </div>
                            <p className="text-sm text-on-surface-variant italic font-medium leading-relaxed">"{apt.reviews[0].comment}"</p>
                         </div>
                      ) : (
                         /* Show Review Form if no review exists */
                         <ReviewForm 
                            appointmentId={apt.id} 
                            patientId={patient?.id} 
                            doctorId={apt.doctors?.id} 
                         />
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 bg-transparent shadow-none">
              <CardContent className="p-12 text-center">
                <p className="text-on-surface-variant/60 font-medium">No completed appointments ready for review.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
