import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import FloatingNav from "@/components/shared/FloatingNav"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-surface-container-low font-inter">
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant/15 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/doctor/dashboard" className="font-manrope font-bold text-lg text-secondary">Doctors Portal Doctor Account</Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/doctor/dashboard" className="text-sm font-medium text-on-surface hover:text-secondary transition-colors">Dashboard</Link>
            <Link href="/doctor/appointments" className="text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors">Appointments</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-on-surface hidden md:block">Dr. {userData?.full_name || 'User'}</div>
          <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs uppercase">
            {(userData?.full_name || 'D').charAt(0)}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6 md:p-8 pb-32">
        {children}
      </main>
      <FloatingNav role="doctor" />
    </div>
  )
}
