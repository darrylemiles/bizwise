"use client"

import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

import { DatePickerField } from "@/components/shared/date-picker-field"
import { NumericInput } from "@/components/shared/numeric-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"

interface Option { label: string; value: string }

function getSelectValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value)
  if (value && typeof value === "object" && "_id" in value) {
    const id = value._id
    return typeof id === "string" || typeof id === "number" ? String(id) : ""
  }
  return ""
}

export function FormSelect<T extends FieldValues>({ control, name, label, options, placeholder = "Select an option", disabled }: { control: Control<T>; name: FieldPath<T>; label: string; options: Option[]; placeholder?: string; disabled?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => { const value = getSelectValue(field.value); const selectedOption = options.find((option) => option.value === value); return <FormField><FormLabel>{label}</FormLabel><Select value={value} onValueChange={(nextValue) => field.onChange(nextValue ?? "")} disabled={disabled}><SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder={selectedOption?.label ?? placeholder}>{selectedOption?.label}</SelectValue></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select><FormMessage>{fieldState.error?.message}</FormMessage></FormField> }} />
}

export function FormNumericInput<T extends FieldValues>({ control, name, label, id, step, min, max, allowNegative = false }: { control: Control<T>; name: FieldPath<T>; label: string; id: string; step?: string; min?: string; max?: string; allowNegative?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <FormField><FormLabel htmlFor={id}>{label}</FormLabel><NumericInput id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} step={step} min={min} max={max} inputMode={step && step !== "1" ? "decimal" : "numeric"} allowNegative={allowNegative} aria-invalid={fieldState.invalid} /><FormMessage>{fieldState.error?.message}</FormMessage></FormField>} />
}

export function FormDatePicker<T extends FieldValues>({ control, name, label, placeholder = "Select a date", disabled }: { control: Control<T>; name: FieldPath<T>; label: string; placeholder?: string; disabled?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <FormField><FormLabel>{label}</FormLabel><DatePickerField value={field.value ?? ""} onChange={field.onChange} placeholder={placeholder} disabled={disabled} /><FormMessage>{fieldState.error?.message}</FormMessage></FormField>} />
}
