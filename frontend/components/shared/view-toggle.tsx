import { LayoutGrid, List } from "lucide-react"

import { Button } from "@/components/ui/button"

export type DataViewMode = "table" | "cards"

export function ViewToggle({ value, onChange }: { value: DataViewMode; onChange: (value: DataViewMode) => void }) {
	return (
		<div className="flex items-center gap-1 rounded-lg border p-1" aria-label="Data view">
			<Button type="button" size="sm" variant={value === "table" ? "secondary" : "ghost"} aria-label="Table view" aria-pressed={value === "table"} onClick={() => onChange("table")}>
				<List className="size-4" />
			</Button>
			<Button type="button" size="sm" variant={value === "cards" ? "secondary" : "ghost"} aria-label="Card view" aria-pressed={value === "cards"} onClick={() => onChange("cards")}>
				<LayoutGrid className="size-4" />
			</Button>
		</div>
	)
}
