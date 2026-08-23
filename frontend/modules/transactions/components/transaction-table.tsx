"use client"

import { Trash2 } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Transaction } from "@/modules/transactions/transactions.types"

interface TransactionTableProps {
	data: Transaction[]
	isLoading: boolean
	isError: boolean
	error: unknown
	onRetry: () => void
	onDelete: (id: string) => void
	onPageChange: (page: number) => void
	onPageSizeChange: (pageSize: number) => void
	page: number
	pageSize: number
	total: number
	totalPages: number
}

export function TransactionTable({ data, isLoading, isError, error, onRetry, onDelete, onPageChange, onPageSizeChange, page, pageSize, total, totalPages }: TransactionTableProps) {
	return (
		<DataTable
			data={data}
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={onRetry}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
			page={page}
			pageSize={pageSize}
			total={total}
			totalPages={totalPages}
			columns={[
				{ head: "Type", render: (item: Transaction) => <StatusBadge value={item.type} /> },
				{ head: "Amount", render: (item: Transaction) => formatCurrency(item.amount) },
				{ head: "Account", render: (item: Transaction) => typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account" },
				{ head: "Category", render: (item: Transaction) => item.category ? (typeof item.category === "string" ? item.category : item.category.name) : "-" },
				{ head: "Date", render: (item: Transaction) => formatDate(item.date) },
				{ head: "Actions", render: (item: Transaction) => <Button size="sm" variant="destructive" aria-label="Delete transaction" onClick={() => onDelete(item._id)}><Trash2 className="size-4" /></Button> },
			]}
			cardRenderer={(item) => <Card className="max-w-md"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><StatusBadge value={item.type} /><p className="mt-2 text-lg font-semibold">{formatCurrency(item.amount)}</p></div><p className="shrink-0 text-sm text-muted-foreground">{formatDate(item.date)}</p></div><p className="truncate text-sm">{typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account"}</p><p className="truncate text-sm text-muted-foreground">{item.description || "No description"}</p><Button size="sm" variant="destructive" aria-label="Delete transaction" onClick={() => onDelete(item._id)}><Trash2 className="mr-1 size-4" />Delete</Button></CardContent></Card>}
		/>
	)
}