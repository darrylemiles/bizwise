"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />
}

function FormMessage({ children, className, ...props }: React.ComponentProps<"p">) {
  if (!children) return null
  return <p className={cn("text-sm text-destructive", className)} {...props}>{children}</p>
}

export { FormField, FormLabel, FormMessage }
