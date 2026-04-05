import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RoleSelection() {
  return (
    <Card className="border border-outline-variant/15 shadow-ambient">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join MediBook</CardTitle>
        <CardDescription>Select your role to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild size="lg" className="w-full h-16 text-lg justify-start px-6 bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface transition-colors shadow-none border border-outline-variant/15 group">
          <Link href="/register/patient">
            <span className="bg-primary/10 group-hover:bg-on-primary/20 text-primary group-hover:text-on-primary w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors">
              P
            </span>
            I am a Patient
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full h-16 text-lg justify-start px-6 bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface transition-colors shadow-none border border-outline-variant/15 group">
          <Link href="/register/doctor">
             <span className="bg-secondary/10 group-hover:bg-on-primary/20 text-secondary group-hover:text-on-primary w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors">
              D
            </span>
            I am a Doctor
          </Link>
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-on-surface-variant">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Login</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
