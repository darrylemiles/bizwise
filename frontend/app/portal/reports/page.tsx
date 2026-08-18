"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { getReports } from "@/modules/reports/reports.api"

export default function ReportsPage() {
	const [from, setFrom] = useState("")
	const [to, setTo] = useState("")

	const reportsQuery = useQuery({
		queryKey: ["reports", { from, to }],
		queryFn: () => getReports({ from: from || undefined, to: to || undefined }),
	})

	const reports = reportsQuery.data

	return (
		<div className="space-y-6">
			<div className="rounded-xl border bg-background p-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Analytics</p>
						<h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
					</div>

					<div className="flex flex-col gap-3 md:flex-row md:items-end">
						<div className="space-y-1">
							<label className="text-xs font-medium text-muted-foreground">From</label>
							<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
						</div>
						<div className="space-y-1">
							<label className="text-xs font-medium text-muted-foreground">To</label>
							<Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
						</div>
						<Button variant="outline" onClick={() => reportsQuery.refetch()}>Refresh</Button>
					</div>
				</div>
			</div>

			{reportsQuery.isError ? <p className="text-sm text-destructive">Unable to load reports.</p> : null}

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

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Expense Categories</CardTitle>
						<CardDescription>Expenses grouped by category</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={reports?.expenses.categories ?? []}
							columns={[
								{ head: "Category", render: (item) => item.category },
								{ head: "Total", render: (item) => formatCurrency(item.total) },
								{ head: "Count", render: (item) => formatNumber(item.count) },
							]}
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
							data={reports?.products.products ?? []}
							columns={[
								{ head: "Product", render: (item) => `${item.product.name} (${item.product.sku})` },
								{ head: "Sold", render: (item) => formatNumber(item.quantitySold) },
								{ head: "Revenue", render: (item) => formatCurrency(item.revenue) },
							]}
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