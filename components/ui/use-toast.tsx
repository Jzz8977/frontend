"use client"

import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = ({ title, description, variant, duration }: ToastProps) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title, {
        description,
        duration: duration || 5000,
      })
    }
    
    return sonnerToast(title || "", {
      description,
      duration: duration || 5000,
    })
  }

  return { toast }
} 