"use client"

import { useEffect, useState, type ComponentProps } from "react"

import { formatInputNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

interface NumericInputProps extends Omit<ComponentProps<"input">, "value" | "onChange" | "onBlur"> {
	value?: number | string | null
	onChange: (value: string) => void
	onBlur?: () => void
	allowNegative?: boolean
}

export function NumericInput({ value, onChange, onBlur, allowNegative = false, ...props }: NumericInputProps) {
	const [displayValue, setDisplayValue] = useState(value == null ? "" : String(value))

	useEffect(() => {
		if (displayValue === "" || displayValue === String(value ?? "")) return
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setDisplayValue(value == null ? "" : String(value))
	}, [value, displayValue])

	const handleChange = (nextValue: string) => {
		const normalized = nextValue.replace(/,/g, "").replace(allowNegative ? /[^\d.-]/g : /[^\d.]/g, "")
		setDisplayValue(normalized)
		onChange(normalized)
	}

	const handleBlur = () => {
		const numericValue = Number(displayValue)
		if (displayValue !== "" && Number.isFinite(numericValue)) {
			setDisplayValue(formatInputNumber(numericValue))
		}
		onBlur?.()
	}

	return <input {...props} className={cn("h-10 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30", props.className)} value={displayValue} onChange={(event) => handleChange(event.target.value)} onBlur={handleBlur} />
}