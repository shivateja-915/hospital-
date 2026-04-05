"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BookAppointment() {
  const { id: doctorId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [doctor, setDoctor] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [patientId, setPatientId] = useState<string | null>(null)
  
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
       const { data: { user } } = await supabase.auth.getUser()
       if (user) {
         const { data: patientData } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
         if (patientData) setPatientId(patientData.id)
       }

       if (typeof doctorId === 'string') {
          const { data: doctorData } = await supabase.from("doctors").select("*, users!inner(full_name)").eq("id", doctorId).single()
          if (doctorData) {
            setDoctor(doctorData)
            
            // Fetch reviews
            const { data: reviewsData } = await supabase
              .from("reviews")
              .select(`
                *,
                patients (
                  users ( full_name )
                )
              `)
              .eq("doctor_id", doctorId)
              .order("created_at", { ascending: false })
            
            if (reviewsData) setReviews(reviewsData)
          } else {
            setError("Doctor profile not found.")
          }
       }
       setInitLoading(false)
    }
    loadData()
  }, [doctorId])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!patientId) {
      setError("Patient profile not found. Please contact support.")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("appointments").insert({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time,
      reason: reason,
      status: "pending"
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/patient/dashboard")
  }

  if (initLoading) return <div className="p-8 text-on-surface-variant animate-pulse font-inter">Loading doctor details...</div>
  if (!doctor) return <div className="p-8"><div className="bg-error-container text-on-error-container p-6 rounded-lg text-center max-w-md mx-auto"><h2 className="font-bold mb-2">Doctor Not Found</h2><p>We couldn't locate this doctor's profile. They may be inactive or there's a system issue.</p><Button className="mt-4" onClick={() => router.push("/patient/doctors")}>Back to Directory</Button></div></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Clinic Gallery */}
      <div className="grid grid-cols-3 gap-2 h-48 md:h-64 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/10">
        <div className="relative group overflow-hidden">
           <img 
            src="/artifacts/media__1775321093528.png" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Clinic View 1" 
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="relative group overflow-hidden">
           <img 
            src="/artifacts/media__1775321256730.png" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Clinic View 2" 
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="relative group overflow-hidden">
           <img 
            src="/artifacts/media__1775321592393.png" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Clinic View 3" 
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        </div>
      </div>

      <div>
        <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Book Appointment</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-on-surface-variant font-inter">Request a consultation with Dr. {String(doctor.users?.full_name || 'Doctor').replace(/^Dr\.\s*/i, '')}</p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-full ${
            doctor.is_online ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${doctor.is_online ? 'bg-success' : 'bg-outline-variant'}`} />
            {doctor.is_online ? 'Available Now' : 'Unavailable'}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Appointment Details</CardTitle>
           <CardDescription>Fill out the form below to request a time slot.</CardDescription>
        </CardHeader>
        <form onSubmit={handleBooking}>
          <CardContent className="space-y-4">
             {error && <div className="p-3 bg-error-container text-on-error-container text-sm rounded-md">{error}</div>}
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="date">Preferred Date</Label>
                 <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="time">Preferred Time</Label>
                 <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
               </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit / Symptoms</Label>
                <textarea 
                  id="reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="flex w-full rounded-sm border-0 bg-surface-container-highest px-3 py-2 text-sm text-on-surface focus:bg-primary-fixed focus:ring-1 focus:ring-primary/20 focus-visible:outline-none transition-colors"
                  required
                />
             </div>

             <div className="bg-surface-container-low p-4 rounded-md mt-4 text-sm">
                <p><span className="font-semibold">Consultation Fee:</span> ${doctor.consultation_fee}</p>
                <p className="text-on-surface-variant mt-1">Payment is typically collected at the clinic or upon confirmation.</p>
             </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {!doctor.is_online && (
              <div className="w-full text-center p-3 text-sm font-semibold text-warning bg-warning/10 border border-warning/20 rounded-md">
                This doctor is currently offline and not accepting new appointments.
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !doctor.is_online}>
              {loading ? "Submitting Request..." : "Confirm Booking"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4 pt-6">
        <h2 className="font-manrope text-2xl font-bold text-on-surface flex items-center gap-2">
          Patient Reviews ({reviews.length})
        </h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-surface-container-low/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-on-surface">
                        {review.patients?.users?.full_name || "Verified Patient"}
                      </p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-outline-variant"}`} 
                            style={{ fill: i < review.rating ? "currentColor" : "none" }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
            <p className="text-on-surface-variant/60 font-medium italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Star({ className, style }: { className?: string, style?: any }) {
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
      style={style}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
