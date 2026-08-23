import { useState, type ReactNode } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ViewToggle, type DataViewMode } from "@/components/shared/view-toggle"
import { TruncatedText } from "@/components/shared/truncated-text"
import { getErrorMessage } from "@/lib/http-error"

type Column<T> = {
	head: string
	render: (item: T) => ReactNode
}

interface DataTableProps<T> {
	columns: Column<T>[]
	data: T[]
	emptyMessage?: string
	errorMessage?: string
	error?: unknown
	onRetry?: () => void
	isError?: boolean
	cardRenderer?: (item: T) => ReactNode
	isLoading?: boolean
	onPageChange?: (page: number) => void
	onPageSizeChange?: (pageSize: number) => void
	page?: number
	pageSize?: number
	pageSizeOptions?: number[]
	total?: number
	totalPages?: number
}

export function DataTable<T>({
	columns,
	data,
	emptyMessage = "No records found",
	errorMessage = "Unable to load data.",
	error,
	onRetry,
	isError,
	cardRenderer,
	isLoading,
	onPageChange,
	onPageSizeChange,
	page = 1,
	pageSize = 10,
	pageSizeOptions = [10, 25, 50, 100],
	total = data.length,
	totalPages = 1,
}: DataTableProps<T>) {
	const [view, setView] = useState<DataViewMode>("table")
	const displayedErrorMessage = getErrorMessage(error, errorMessage)
	const displayData = isLoading || isError ? [] : data
	return (
		<div className="min-w-0 space-y-4">
			{cardRenderer ? (
				<div className="flex justify-end">
					<ViewToggle value={view} onChange={setView} />
				</div>
			) : null}
			{view === "cards" && cardRenderer ? (
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{isLoading ? <div className="rounded-lg border p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">Loading...</div> : null}
					{isError ? <div className="rounded-lg border p-6 text-sm text-destructive sm:col-span-2 xl:col-span-3"><div className="flex flex-col items-center gap-3"><span>{displayedErrorMessage}</span>{onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}</div></div> : null}
					{!isLoading && !isError && displayData.length === 0 ? <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">{emptyMessage}</div> : null}
					{!isLoading && !isError ? displayData.map((item, index) => <div key={index}>{cardRenderer(item)}</div>) : null}
				</div>
			) : (
			<div className="min-w-0 max-w-full overflow-x-auto overflow-y-auto rounded-lg border bg-background">
				<table className="w-full min-w-[640px] table-fixed text-sm">
					<thead className="border-b bg-muted/50 text-left text-muted-foreground">
						<tr>
							{columns.map((column) => (
								<th key={column.head} className="px-4 py-3 font-medium">
									{column.head}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td className="px-4 py-10 text-center text-muted-foreground" colSpan={columns.length}>
									Loading...
								</td>
							</tr>
						) : isError ? (
							<tr>
								<td className="px-4 py-10 text-center text-destructive" colSpan={columns.length}>
									<div className="flex flex-col items-center gap-3">
										<span>{displayedErrorMessage}</span>
										<Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button>
									</div>
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td className="px-4 py-10 text-center text-muted-foreground" colSpan={columns.length}>
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((item, index) => (
								<tr key={index} className="border-t align-top">
									{columns.map((column) => (
										<td key={column.head} className="max-w-0 px-4 py-3">
												{renderCell(column.render(item))}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			)}

			{onPageChange && (totalPages > 1 || onPageSizeChange) ? (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<span>Page {page} of {totalPages} ({total} total)</span>
						{onPageSizeChange ? <Select value={String(pageSize)} onValueChange={(value) => value && onPageSizeChange(Number(value))}><SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger><SelectContent>{pageSizeOptions.map((option) => <SelectItem key={option} value={String(option)}>{option} / page</SelectItem>)}</SelectContent></Select> : null}
					</div>

					<div className="flex gap-2">
						<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
							<ChevronLeft className="mr-1 size-4" />
							Previous
						</Button>
						<Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
							Next
							<ChevronRight className="ml-1 size-4" />
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

function renderCell(value: ReactNode) {
	return typeof value === "string" ? <TruncatedText>{value}</TruncatedText> : value
}