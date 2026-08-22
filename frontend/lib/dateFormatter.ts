import { format as formatDateValue, isValid, parseISO } from "date-fns"

export function dateFormatter(
	dateString?: string | null,
	format = "MMM d, yyyy",
	isTimeIncluded = false,
) {
	if (!dateString) return "-"

	const date = parseISO(dateString)
	if (!isValid(date)) return "-"

	return formatDateValue(date, isTimeIncluded ? `${format}, h:mm a` : format)
}