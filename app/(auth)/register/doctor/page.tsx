"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DoctorRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    fee: "",
    license: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: 'doctor',
          full_name: formData.fullName,
          specialization: formData.specialization,
          experience_years: formData.experience,
          consultation_fee: formData.fee,
          license_number: formData.license,
          bio: `I am Dr. ${formData.fullName}, eager to provide the best care.`
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Automatic trigger handles public.users and public.doctors insertion
      // For email confirmations, session is null, so we must tell them to check email
      if (!authData.session) {
         setError("Registration successful! Please check your email to confirm your account.")
         setLoading(false)
         return
      }

      router.push("/doctor/dashboard")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  return (
    <Card className="border border-outline-variant/15 shadow-ambient max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Doctor Registration</CardTitle>
        <CardDescription>Join our platform as a healthcare provider</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-error-container text-on-error-container text-sm rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (with Title)</Label>
            <Input id="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Dr. John Doe" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <select 
                id="specialization" 
                value={formData.specialization} 
                onChange={handleChange} 
                required
                className="flex h-11 w-full rounded-sm border-0 bg-surface-container-highest px-3 py-2 text-sm text-on-surface focus:bg-primary-fixed focus:ring-1 focus:ring-primary/20 focus-visible:outline-none transition-colors"
               >
                <option value="">Select</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="General Physician">General Physician</option>
                <option value="Orthopedic">Orthopedic</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input id="license" value={formData.license} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input id="experience" type="number" min="0" value={formData.experience} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Consultation Fee ($)</Label>
              <Input id="fee" type="number" min="0" value={formData.fee} onChange={handleChange} required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register as Doctor"}
          </Button>
          <p className="text-sm text-on-surface-variant">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Login</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
