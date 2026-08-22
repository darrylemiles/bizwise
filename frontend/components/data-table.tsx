import { useState, type ReactNode } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ViewToggle, type DataViewMode } from "@/components/shared/view-toggle"

type Column<T> = {
	head: string
	render: (item: T) => ReactNode
}

interface DataTableProps<T> {
	columns: Column<T>[]
	data: T[]
	emptyMessage?: string
	errorMessage?: string
	onRetry?: () => void
	isError?: boolean
	cardRenderer?: (item: T) => ReactNode
	isLoading?: boolean
	onPageChange?: (page: number) => void
	page?: number
	totalPages?: number
}

export function DataTable<T>({
	columns,
	data,
	emptyMessage = "No records found",
	errorMessage = "Unable to load data.",
	onRetry,
	isError,
	cardRenderer,
	isLoading,
	onPageChange,
	page = 1,
	totalPages = 1,
}: DataTableProps<T>) {
	const [view, setView] = useState<DataViewMode>("table")
	const displayData = isLoading || isError ? [] : data
	return (
		<div className="space-y-4">
			{cardRenderer ? <div className="flex justify-end"><ViewToggle value={view} onChange={setView} /></div> : null}
			{view === "cards" && cardRenderer ? (
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{isLoading ? <div className="rounded-lg border p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">Loading...</div> : isError ? <div className="rounded-lg border p-6 text-sm text-destructive sm:col-span-2 xl:col-span-3"><div className="flex flex-col items-center gap-3"><span>{errorMessage}</span>{onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}</div></div> : displayData.length === 0 ? <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">{emptyMessage}</div> : displayData.map((item, index) => <div key={index}>{cardRenderer(item)}</div>)}
				</div>
			) : (
			<div className="max-w-full overflow-x-auto overflow-y-auto rounded-lg border bg-background">
				<table className="w-full min-w-[640px] text-sm">
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
										<span>{errorMessage}</span>
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
										<td key={column.head} className="px-4 py-3">
											{column.render(item)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			)}

			{onPageChange && totalPages > 1 ? (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</p>

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