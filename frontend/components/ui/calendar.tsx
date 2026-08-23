"use client"

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
  disabled?: (date: Date) => boolean
}

export function Calendar({ value, onChange, disabled }: CalendarProps) {
  const [month, setMonth] = useState(value ?? new Date())
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) })
  const years = Array.from({ length: 21 }, (_, index) => month.getFullYear() - 10 + index)

  return (
    <div className="w-72 p-1">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => setMonth((current) => subMonths(current, 1))}>
          <ChevronLeft />
        </Button>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">{format(month, "MMMM")}</p>
          <Select value={String(month.getFullYear())} onValueChange={(year) => year && setMonth(new Date(Number(year), month.getMonth(), 1))}>
            <SelectTrigger className="h-7 w-20 border-0 px-1 text-sm font-medium"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
          </Select>
        </div>
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
