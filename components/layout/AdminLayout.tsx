'use client'

import React from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 container py-10">
        {children}
      </div>
    </div>
  )
} 