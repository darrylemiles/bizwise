import type { SelectHTMLAttributes } from "react"

interface Option {
	label: string
	value: string
}

interface RemoteSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	options: Option[]
	placeholder?: string
	isLoading?: boolean
}

export function RemoteSelect({
	options,
	placeholder = "Select an option",
	isLoading,
	className,
	...props
}: RemoteSelectProps) {
	return (
		<select
			{...props}
			className={className ?? "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"}
		>
			<option value="">{isLoading ? "Loading..." : placeholder}</option>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}