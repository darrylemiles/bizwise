import { dateFormatter } from "@/lib/dateFormatter"

const currencyFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	currencyDisplay: "narrowSymbol",
	maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-US")

export function formatCurrency(value?: number | null) {
	return currencyFormatter.format(value ?? 0)
}

export function formatNumber(value?: number | null) {
	return numberFormatter.format(value ?? 0)
}

export function formatInputNumber(value?: number | string | null) {
	if (value == null || value === "") return ""

	const numericValue = typeof value === "number" ? value : Number(value.replace(/,/g, ""))
	return Number.isFinite(numericValue) ? numberFormatter.format(numericValue) : String(value)
}

export function formatDate(value?: string | Date | null) {
	if (!value) return "-"

	return dateFormatter(typeof value === "string" ? value : value.toISOString(), "MMM d, yyyy", true)
}