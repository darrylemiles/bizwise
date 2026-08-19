"use client"

import { format, parseISO } from "date-fns"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerFieldProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function DatePickerField({ value, onChange, placeholder = "Select a date", disabled, id }: DatePickerFieldProps) {
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={<Button id={id} type="button" variant="outline" disabled={disabled} className={cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground")} />}
      >
        <CalendarDays className="mr-2 size-4" />
        {selected ? format(selected, "MMM d, yyyy") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <Calendar value={selected} onChange={(date) => onChange(format(date, "yyyy-MM-dd"))} />
      </PopoverContent>
    </Popover>
  )
}
