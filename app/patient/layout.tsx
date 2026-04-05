import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import FloatingNav from "@/components/shared/FloatingNav"
import LogoutButton from "@/components/shared/LogoutButton"

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/patient/dashboard" className="font-manrope font-bold text-lg text-primary">Hospital Appointments Patient Account</Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/patient/dashboard" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/patient/doctors" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Find a Doctor</Link>
            <Link href="/patient/appointments" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">My Appointments</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-on-surface leading-none">{userData?.full_name || 'Patient'}</p>
              <p className="text-xs text-on-surface-variant mt-1">Patient</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm uppercase border border-primary/20">
              {(userData?.full_name || 'P').charAt(0)}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto p-6 md:p-8 pb-32">
        {children}
      </main>
      <FloatingNav role="patient" />
    </div>
  )
}
