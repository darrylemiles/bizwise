"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField, FormLabel } from "@/components/ui/form"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { DataTable } from "@/components/data-table"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { getErrorMessage } from "@/lib/http-error"
import { getReports } from "@/modules/reports/reports.api"
import type { ExpenseReportData, ProductReportData } from "@/modules/reports/reports.types"
import { ReportCharts } from "@/components/reports/report-charts"

export default function ReportsPage() {
	const [from, setFrom] = useState("")
	const [to, setTo] = useState("")
	const [expenseSearch, setExpenseSearch] = useState("")
	const [sortReports, setSortReports] = useState<"name" | "value">("value")

	const reportsQuery = useQuery({
		queryKey: ["reports", { from, to }],
		queryFn: () => getReports({ from: from || undefined, to: to || undefined }),
	})

	const reports = reportsQuery.data
	const expenseCategories = useMemo(() => [...(reports?.expenses.categories ?? [])]
		.filter((item) => item.category.toLowerCase().includes(expenseSearch.toLowerCase()))
		.sort((left, right) => sortReports === "name" ? left.category.localeCompare(right.category) : right.total - left.total), [expenseSearch, reports?.expenses.categories, sortReports])
	const productRows = useMemo(() => [...(reports?.products.products ?? [])].sort((left, right) => right.revenue - left.revenue), [reports?.products.products])
	const expenseColumns = useMemo(() => [
		{ head: "Category", render: (item: ExpenseReportData["categories"][number]) => item.category },
		{ head: "Total", render: (item: ExpenseReportData["categories"][number]) => formatCurrency(item.total) },
		{ head: "Count", render: (item: ExpenseReportData["categories"][number]) => formatNumber(item.count) },
	], [])
	const productColumns = useMemo(() => [
		{ head: "Product", render: (item: ProductReportData["products"][number]) => item.product ? `${item.product.name ?? "Unknown product"} (${item.product.sku ?? "No SKU"})` : "Unknown product" },
		{ head: "Sold", render: (item: ProductReportData["products"][number]) => formatNumber(item.quantitySold) },
		{ head: "Revenue", render: (item: ProductReportData["products"][number]) => formatCurrency(item.revenue) },
	], [])

	return (
		<div className="space-y-6">
			<div className="rounded-xl border bg-background p-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Analytics</p>
						<h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
					</div>

					<div className="flex flex-col gap-3 md:flex-row md:items-end">
						<FormField><FormLabel className="text-xs text-muted-foreground">From</FormLabel><DatePickerField value={from} onChange={setFrom} /></FormField>
						<FormField><FormLabel className="text-xs text-muted-foreground">To</FormLabel><DatePickerField value={to} onChange={setTo} /></FormField>
						<Button variant="outline" onClick={() => reportsQuery.refetch()}>Refresh</Button>
					</div>
				</div>
			</div>

			{reportsQuery.isError ? <p className="text-sm text-destructive">{getErrorMessage(reportsQuery.error, "Unable to load reports.")}</p> : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<StatCard label="Revenue" value={formatCurrency(reports?.overview.financial.income)} />
					<StatCard label="Expenses" value={formatCurrency(reports?.overview.financial.expenses)} />
					<StatCard label="Net Profit" value={formatCurrency(reports?.overview.financial.netProfit)} />
					<StatCard label="Inventory Value" value={formatCurrency(reports?.overview.inventory.summary.inventoryValue)} />
			</div>

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Financial Report</CardTitle>
						<CardDescription>Revenue and expense totals for the selected period</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>Income: {formatCurrency(reports?.financial.income)}</p>
						<p>Expenses: {formatCurrency(reports?.financial.expenses)}</p>
						<p>Net profit: {formatCurrency(reports?.financial.netProfit)}</p>
						<p>Income transactions: {formatNumber(reports?.financial.incomeTransactions)}</p>
						<p>Expense transactions: {formatNumber(reports?.financial.expenseTransactions)}</p>
						<p className="text-muted-foreground">Period: {formatDate(reports?.financial.period.from)} - {formatDate(reports?.financial.period.to)}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Sales Report</CardTitle>
						<CardDescription>Sales, cost, and profit breakdown</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>Total sales: {formatNumber(reports?.sales.totalSales)}</p>
						<p>Revenue: {formatCurrency(reports?.sales.revenue)}</p>
						<p>Cost: {formatCurrency(reports?.sales.cost)}</p>
						<p>Profit: {formatCurrency(reports?.sales.profit)}</p>
						<p className="text-muted-foreground">Period: {formatDate(reports?.sales.period.from)} - {formatDate(reports?.sales.period.to)}</p>
					</CardContent>
				</Card>
			</div>

			<ReportCharts reports={reports} />

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Expense Categories</CardTitle>
						<CardDescription>Expenses grouped by category</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="mb-4 flex flex-col gap-2 sm:flex-row">
							<input className="h-9 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm" placeholder="Filter categories" value={expenseSearch} onChange={(event) => setExpenseSearch(event.target.value)} />
							<Button type="button" variant="outline" onClick={() => setSortReports((current) => current === "value" ? "name" : "value")}>Sort by {sortReports === "value" ? "name" : "value"}</Button>
						</div>
						<DataTable
							data={expenseCategories}
							isLoading={reportsQuery.isLoading}
							isError={reportsQuery.isError}
							error={reportsQuery.error}
							onRetry={() => reportsQuery.refetch()}
							columns={expenseColumns}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Top Products</CardTitle>
						<CardDescription>Products by revenue in the selected period</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={productRows}
							isLoading={reportsQuery.isLoading}
							isError={reportsQuery.isError}
							error={reportsQuery.error}
							onRetry={() => reportsQuery.refetch()}
							columns={productColumns}
						/>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Low Stock" value={formatNumber(reports?.inventory.summary.lowStock)} />
				<StatCard label="Out of Stock" value={formatNumber(reports?.inventory.summary.outOfStock)} />
				<StatCard label="Sales Count" value={formatNumber(reports?.overview.sales.totalSales)} />
				<StatCard label="Total Products" value={formatNumber(reports?.inventory.summary.totalProducts)} />
			</div>
		</div>
	)
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<Card>
			<CardContent className="p-6">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="text-2xl font-semibold tracking-tight">{value}</p>
			</CardContent>
		</Card>
	)
}