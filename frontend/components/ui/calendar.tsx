"use client"

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
  disabled?: (date: Date) => boolean
}

export function Calendar({ value, onChange, disabled }: CalendarProps) {
  const [month, setMonth] = useState(value ?? new Date())
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) })

  return (
    <div className="w-72 p-1">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => setMonth((current) => subMonths(current, 1))}>
          <ChevronLeft />
        </Button>
        <p className="text-sm font-medium">{format(month, "MMMM yyyy")}</p>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => setMonth((current) => addMonths(current, 1))}>
          <ChevronRight />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="py-1">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isDisabled = disabled?.(day) ?? false
          return (
            <Button
              key={day.toISOString()}
              type="button"
              variant={value && isSameDay(value, day) ? "default" : "ghost"}
              size="icon-sm"
              disabled={isDisabled}
              className={cn(!isSameMonth(day, month) && "text-muted-foreground/40")}
              onClick={() => onChange?.(day)}
            >
              {format(day, "d")}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
