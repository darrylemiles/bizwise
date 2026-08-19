"use client"

import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

import { DatePickerField } from "@/components/shared/date-picker-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"

interface Option { label: string; value: string }

export function FormSelect<T extends FieldValues>({ control, name, label, options, placeholder = "Select an option", disabled }: { control: Control<T>; name: FieldPath<T>; label: string; options: Option[]; placeholder?: string; disabled?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <FormField><FormLabel>{label}</FormLabel><Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)} disabled={disabled}><SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select><FormMessage>{fieldState.error?.message}</FormMessage></FormField>} />
}

export function FormDatePicker<T extends FieldValues>({ control, name, label, placeholder = "Select a date", disabled }: { control: Control<T>; name: FieldPath<T>; label: string; placeholder?: string; disabled?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <FormField><FormLabel>{label}</FormLabel><DatePickerField value={field.value ?? ""} onChange={field.onChange} placeholder={placeholder} disabled={disabled} /><FormMessage>{fieldState.error?.message}</FormMessage></FormField>} />
}
