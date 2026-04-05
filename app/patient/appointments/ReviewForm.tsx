"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReviewFormProps {
  appointmentId: string
  patientId: string
  doctorId: string
  existingReview?: any
}

export default function ReviewForm({ appointmentId, patientId, doctorId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating.")
      return
    }
    if (!comment.trim()) {
      setError("Please write a review description.")
      return
    }

    setLoading(true)
    setError(null)
    
    const { error: insertError } = await supabase
      .from("reviews")
      .upsert({
        appointment_id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        rating,
        comment: comment.trim()
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 mt-4">
      <h4 className="font-bold text-on-surface mb-2">Leave a Review</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Star
                className={`w-8 h-8 ${
                  (hoverRating || rating) >= star 
                    ? "fill-warning text-warning" 
                    : "text-outline-variant"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-on-surface-variant flex items-center">
            {rating > 0 ? `${rating} / 5` : "Select stars"}
          </span>
        </div>

        <div className="space-y-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Tell us about your experience with the doctor..."
            className="w-full min-h-[100px] p-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40"
          />
        </div>

        {error && <p className="text-xs text-error font-medium">{error}</p>}

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  )
}
