import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DoctorsList() {
  const supabase = await createClient()

  const { data: doctors, error } = await supabase
    .from("doctors")
    .select(`
      *,
      users ( full_name ),
      reviews (
        rating
      )
    `)

  return (
    <div className="space-y-6">
      <div className="text-[10px] opacity-20">Live Sync: {new Date().toISOString()}</div>
      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg">
          Error loading doctors: {error.message}
        </div>
      )}
      {/* 
      <pre className="text-xs bg-surface-container overflow-auto p-4 rounded-lg">
        {JSON.stringify(doctors, null, 2)}
      </pre> 
      */}
      <div>



        <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Find a Doctor</h1>
        <p className="text-on-surface-variant font-inter">Browse our network of specialists and book an appointment.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {doctors && doctors.length > 0 ? (
           doctors.map((doctor) => (
             <Card key={doctor.id} className="flex flex-col">
               <CardHeader>
                 <div className="flex gap-4 items-center mb-2">
                     <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-lg uppercase">
                        {(Array.isArray(doctor.users) ? doctor.users[0]?.full_name : doctor.users?.full_name || 'D').charAt(0)}
                     </div>
                     <div>
                        <CardTitle className="text-xl">
                          Dr. {String(Array.isArray(doctor.users) ? doctor.users[0]?.full_name : doctor.users?.full_name || 'Doctor').replace(/^Dr\.\s*/i, '')}
                        </CardTitle>
                        
                        <div className="flex items-center gap-1 my-0.5">
                           {/* Rating Display */}
                           <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => {
                                 const ratings = doctor.reviews || []
                                 const avg = ratings.length > 0 
                                    ? ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length 
                                    : 0
                                 return (
                                    <Star 
                                       key={s} 
                                       className={`w-3 h-3 ${s <= Math.round(avg) ? 'fill-warning text-warning' : 'text-outline-variant'}`}
                                    />
                                 )
                              })}
                           </div>
                           {doctor.reviews?.length > 0 && (
                             <span className="text-[10px] font-bold text-on-surface-variant">
                               ({doctor.reviews.length})
                             </span>
                           )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-secondary-fixed-dim text-on-secondary-fixed">
                            {doctor.specialization}
                          </p>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-full ${
                            doctor.is_online ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${doctor.is_online ? 'bg-success' : 'bg-outline-variant'}`} />
                            {doctor.is_online ? 'Available Now' : 'Unavailable'}
                          </span>
                        </div>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-on-surface-variant line-clamp-3 mb-4">{doctor.bio}</p>
                  <div className="space-y-1 text-sm text-on-surface">
                    <p><span className="font-semibold">Experience:</span> {doctor.experience_years} years</p>
                    <p><span className="font-semibold">Consultation Fee:</span> ${doctor.consultation_fee}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/patient/book/${doctor.id}`}>Book Appointment</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-surface-container-low rounded-2xl border-dashed border-2 border-outline-variant/30">
               <p className="text-on-surface-variant text-lg">No doctors found in the database.</p>
               <p className="text-xs text-on-surface-variant/70 mt-2">Check console/network for errors.</p>
            </div>
          )}
      </div>
    </div>
  )
}
function Star({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
