import type { ComponentProps } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Option {
	label: string
	value: string
}

interface RemoteSelectProps extends Omit<ComponentProps<typeof Select>, "value" | "onValueChange" | "children"> {
	options: Option[]
	placeholder?: string
	isLoading?: boolean
	className?: string
	value?: string
	onValueChange?: (value: string | null) => void
}

export function RemoteSelect({
	options,
	placeholder = "Select an option",
	isLoading,
	className,
	value,
	onValueChange,
	...props
}: RemoteSelectProps) {
	return (
		<Select {...props} value={value ?? ""} onValueChange={onValueChange}>
			<SelectTrigger className={className} disabled={props.disabled || isLoading}>
				<SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
			</SelectContent>
		</Select>
	)
}