"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, XCircle, Clock, User, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppointmentsManagerProps {
  initialAppointments: any[]
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AppointmentsManager({ initialAppointments }: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const tabs: { value: FilterStatus, label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter)

  const updateStatus = async (id: string, newStatus: string) => {
    setLoading(id)
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setAppointments(appointments.map(a => 
        a.id === id ? { ...a, status: newStatus } : a
      ))
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === tab.value 
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {tab.label}
            <span className="ml-2 opacity-70 text-xs">
               ({tab.value === 'all' ? appointments.length : appointments.filter(a => a.status === tab.value).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const statusColor = 
              apt.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 
              apt.status === 'completed' ? 'bg-surface-variant text-on-surface-variant border-surface-variant/50' : 
              apt.status === 'cancelled' ? 'bg-error/10 text-error border-error/20' :
              'bg-warning/10 text-warning border-warning/20';
              
            const dotColor = 
              apt.status === 'confirmed' ? 'bg-success' : 
              apt.status === 'completed' ? 'bg-outline' : 
              apt.status === 'cancelled' ? 'bg-error' :
              'bg-warning';

            return (
              <Card key={apt.id} className="overflow-hidden border-outline-variant/15 hover:border-primary/20 transition-all duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Patient Info Area */}
                    <div className="p-6 md:w-1/3 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-lg">
                          {apt.patients?.users?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-on-surface leading-tight">
                            {apt.patients?.users?.full_name || 'Anonymous'}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full border capitalize ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            {apt.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                           <Calendar className="w-4 h-4 opacity-70" /> {apt.appointment_date}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
                           <Clock className="w-4 h-4 opacity-70" /> {apt.appointment_time}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details & Actions Area */}
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div className="mb-6">
                         <h4 className="text-sm font-bold text-on-surface mb-2 uppercase tracking-wide text-primary">Reason for Visit</h4>
                         <p className="text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10 text-sm">
                           {apt.reason || 'No specific reason provided by the patient.'}
                         </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 justify-end mt-auto pt-4 border-t border-outline-variant/10">
                        {apt.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              className="border-error text-error hover:bg-error-container hover:text-on-error-container"
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              disabled={loading === apt.id}
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                            <Button 
                              className="bg-success text-on-success hover:bg-success/90"
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              disabled={loading === apt.id}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> Accept
                            </Button>
                          </>
                        )}
                        
                        {apt.status === 'confirmed' && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              disabled={loading === apt.id}
                            >
                              Cancel Booking
                            </Button>
                            <Button 
                              onClick={() => updateStatus(apt.id, 'completed')}
                              disabled={loading === apt.id}
                            >
                              <Check className="w-4 h-4 mr-2" /> Mark Complete
                            </Button>
                          </>
                        )}

                        {apt.status === 'completed' && (
                          <div className="text-success flex items-center gap-2 text-sm font-bold bg-success/10 px-4 py-2 rounded-lg">
                            <CheckCircle className="w-5 h-5" /> Consultation Finished
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-dashed border-2 border-outline-variant/30 bg-transparent shadow-none">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
                <Calendar className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">
                {filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
              </h3>
              <p className="text-on-surface-variant max-w-sm mx-auto text-lg">
                Share your profile to get bookings!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
