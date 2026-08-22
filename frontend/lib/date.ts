export function toApiDate(value?: string) {
	if (!value) return undefined

	return value.length === 10 ? `${value}T00:00:00.000Z` : value
}
