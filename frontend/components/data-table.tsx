import type { ReactNode } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type Column<T> = {
	head: string
	render: (item: T) => ReactNode
}

interface DataTableProps<T> {
	columns: Column<T>[]
	data: T[]
	emptyMessage?: string
	isLoading?: boolean
	onPageChange?: (page: number) => void
	page?: number
	totalPages?: number
}

export function DataTable<T>({
	columns,
	data,
	emptyMessage = "No records found",
	isLoading,
	onPageChange,
	page = 1,
	totalPages = 1,
}: DataTableProps<T>) {
	return (
		<div className="space-y-4">
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