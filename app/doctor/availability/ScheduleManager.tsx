"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, Clock } from "lucide-react"

interface Slot {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface ScheduleManagerProps {
  doctorId: string
  initialSlots: Slot[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ScheduleManager({ doctorId, initialSlots }: ScheduleManagerProps) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const today = new Date().getDay()

  const handleAddSlot = async (dayIndex: number) => {
    // Default slot to add
    const newSlot = {
      doctor_id: doctorId,
      day_of_week: dayIndex,
      start_time: "09:00",
      end_time: "10:00"
    }
    
    setLoading(true)
    const { data, error } = await supabase
      .from("availability")
      .insert(newSlot)
      .select()
      .single()
      
    if (data && !error) {
       setSlots([...slots, data])
    }
    setLoading(false)
  }

  const handleRemoveSlot = async (slotId: string | undefined) => {
    if (!slotId) return
    setLoading(true)
    await supabase.from("availability").delete().eq("id", slotId)
    setSlots(slots.filter(s => s.id !== slotId))
    setLoading(false)
  }

  const toggleDay = async (dayIndex: number, isActive: boolean) => {
     if (!isActive) {
       // Clear all slots for that day
       setLoading(true)
       await supabase.from("availability").delete().eq("doctor_id", doctorId).eq("day_of_week", dayIndex)
       setSlots(slots.filter(s => s.day_of_week !== dayIndex))
       setLoading(false)
     } else {
       // Add one default slot to activate the day
       handleAddSlot(dayIndex)
     }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DAYS.map((day, index) => {
        const daySlots = slots.filter(s => s.day_of_week === index).sort((a, b) => a.start_time.localeCompare(b.start_time))
        const isActive = daySlots.length > 0
        const isToday = index === today

        return (
          <Card 
            key={day} 
            className={`transition-all duration-200 ${
              isToday ? 'border-primary shadow-sm' : 'border-outline-variant/15'
            } ${
              !isActive ? 'bg-surface-container/50 opacity-80' : 'bg-surface'
            }`}
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CardTitle className={`text-lg ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                  {day} {isToday && <span className="ml-2 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Today</span>}
                </CardTitle>
              </div>
              
              <button 
                onClick={() => toggleDay(index, !isActive)}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isActive ? 'bg-success' : 'bg-surface-variant'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <div key={slot.id || Math.random()} className="group flex items-center gap-1.5 bg-success/15 border border-success/30 text-success-700 dark:text-success-400 px-3 py-1.5 rounded-full text-sm font-medium">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        <span>{slot.start_time}</span>
                        <span className="opacity-50">-</span>
                        <span>{slot.end_time}</span>
                        <button 
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="ml-1 opacity-50 hover:opacity-100 hover:text-error transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddSlot(index)}
                    disabled={loading}
                    className="w-full text-xs h-8 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Time Slot
                  </Button>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Day Off</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
