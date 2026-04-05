"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface OnlineToggleProps {
  initialIsOnline: boolean
  doctorId: string
}

export default function OnlineToggle({ initialIsOnline, doctorId }: OnlineToggleProps) {
  const [isOnline, setIsOnline] = useState(initialIsOnline)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleOnlineStatus() {
    setLoading(true)
    const newStatus = !isOnline
    setIsOnline(newStatus) // Optimistic update
    
    await supabase
      .from("doctors")
      .update({ is_online: newStatus })
      .eq("id", doctorId)
      
    setLoading(false)
    router.refresh()
  }

  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-500 shadow-xl ${
      isOnline 
        ? 'bg-success/5 border-success/30 shadow-success/10' 
        : 'bg-surface-container border-outline-variant/30 grayscale'
    }`}>
      {/* Decorative gradient backdrops */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[80px] transition-colors duration-1000 ${
        isOnline ? 'bg-success/20' : 'bg-on-surface-variant/10'
      }`} />
      <div className={`absolute -left-16 -bottom-16 w-32 h-32 rounded-full blur-[60px] transition-colors duration-1000 ${
        isOnline ? 'bg-primary/10' : 'bg-outline-variant/5'
      }`} />
      
      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <h3 className="font-manrope text-2xl font-black text-on-surface uppercase tracking-tight">Status</h3>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border animate-in fade-in zoom-in duration-500 ${
              isOnline 
                ? 'bg-success/10 text-success border-success/20' 
                : 'bg-on-surface-variant/10 text-on-surface-variant border-surface-variant'
            }`}>
              {isOnline ? "🟢 Live & Visible" : "🔴 Hidden"}
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant max-w-xs">
            {isOnline 
              ? "Your profile is active. Patients can browse your slots and book appointments." 
              : "Patients cannot see your profile. You won't receive new bookings."}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
             <div 
               onClick={toggleOnlineStatus}
               className={`relative h-8 w-14 cursor-pointer rounded-full p-1 transition-all duration-300 ease-in-out ${
                 isOnline ? 'bg-secondary ring-2 ring-secondary/20' : 'bg-outline-variant/30'
               }`}
             >
                <div 
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                    isOnline ? 'ml-6' : 'ml-0'
                  }`}
                >
                   {isOnline ? (
                      <svg className="h-3.5 w-3.5 text-secondary fill-current" viewBox="0 0 24 24">
                        <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                      </svg>
                   ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                   )}
                </div>
             </div>
          </div>
          
          <button 
            onClick={toggleOnlineStatus}
            disabled={loading}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-secondary transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : (isOnline ? "Go Offline" : "Go Online")}
          </button>
        </div>
      </div>
    </div>
  )
}
