"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Search, CalendarDays, Clock, User, LogOut } from "lucide-react"

interface NavLink {
  href: string
  label: string
  icon: any
}

export default function FloatingNav({ role }: { role: 'patient' | 'doctor' }) {
  const pathname = usePathname()
  
  const patientLinks: NavLink[] = [
    { href: '/patient/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/patient/doctors', label: 'Doctors', icon: Search },
    { href: '/patient/appointments', label: 'My Visits', icon: CalendarDays },
  ]
  
  const doctorLinks: NavLink[] = [
    { href: '/doctor/dashboard', label: 'Console', icon: LayoutDashboard },
    { href: '/doctor/appointments', label: 'Bookings', icon: CalendarDays },
  ]
  
  const links = role === 'patient' ? patientLinks : doctorLinks
  const colorClass = role === 'patient' ? 'text-primary' : 'text-secondary'
  const bgActive = role === 'patient' ? 'bg-primary/10' : 'bg-secondary/10'
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-auto px-4 md:px-0 max-w-[95vw]">
      <nav className="flex items-center gap-1 p-1.5 px-3 bg-surface/60 backdrop-blur-xl border border-outline-variant/30 rounded-[2.5rem] shadow-2xl hover:bg-surface/80 transition-colors group">
         <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none rounded-[2.5rem]" />
         
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[72px] h-14 rounded-[2rem] transition-all duration-300 relative overflow-hidden group/link ${
                isActive ? colorClass : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${isActive ? 'translate-y-0' : 'group-hover/link:-translate-y-1'}`}>
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover/link:scale-110'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/link:opacity-100 group-hover/link:scale-90'}`}>
                  {link.label}
                </span>
              </div>
              
              {isActive && (
                <div className={`absolute inset-0 ${bgActive} border border-primary/20 rounded-[2rem] -z-10 animate-in fade-in zoom-in duration-500`} />
              )}
              
              {!isActive && (
                <div className="absolute inset-0 bg-on-surface/5 scale-0 group-hover/link:scale-100 transition-transform duration-300 rounded-[2rem] -z-10" />
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Decorative side curved shadow finish */}
      <div className="absolute -z-10 bottom-0 left-4 right-4 h-4 bg-primary/20 blur-2xl opacity-50 rounded-full" />
    </div>
  )
}
