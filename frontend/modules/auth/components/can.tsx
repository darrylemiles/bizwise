"use client"

import { UserRole } from "../auth.types"
import { useAuth } from "../hooks/use-auth"

interface CanProps {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({
  roles,
  children,
  fallback = null,
}: CanProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return fallback
  }

  return children
}