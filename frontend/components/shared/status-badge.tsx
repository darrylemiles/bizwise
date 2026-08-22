import { Badge } from "@/components/ui/badge"
import titleCase from "@/lib/titleCase"

const destructiveValues = new Set(["cancelled", "inactive", "expense", "out_of_stock"])
const secondaryValues = new Set(["completed", "active", "income", "in_stock", "admin"])

export function StatusBadge({ value, fallback = "Unknown" }: { value?: string | null; fallback?: string }) {
	const normalized = value?.trim().toLowerCase()
	const label = normalized ? titleCase(normalized) : fallback
	const variant = normalized && destructiveValues.has(normalized)
		? "destructive"
		: normalized && secondaryValues.has(normalized)
			? "secondary"
			: "outline"

	return <Badge variant={variant}>{label}</Badge>
}
