const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-US")

export function formatCurrency(value?: number | null) {
	return currencyFormatter.format(value ?? 0)
}

export function formatNumber(value?: number | null) {
	return numberFormatter.format(value ?? 0)
}

export function formatDate(value?: string | Date | null) {
	if (!value) return "-"

	const date = typeof value === "string" ? new Date(value) : value

	if (Number.isNaN(date.getTime())) {
		return "-"
	}

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date)
}