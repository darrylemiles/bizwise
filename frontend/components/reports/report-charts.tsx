import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { ReportsBundle } from "@/modules/reports/reports.types"

export function ReportCharts({ reports }: { reports?: ReportsBundle }) {
	const categories = reports?.expenses.categories ?? []
	const products = reports?.products.products ?? []
	const maxExpense = Math.max(...categories.map((item) => item.total), 1)
	const maxRevenue = Math.max(...products.map((item) => item.revenue), 1)

	return (
		<div className="grid gap-4 xl:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Income vs expenses</CardTitle>
					<CardDescription>Totals for the selected reporting period</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<Bar label="Income" value={reports?.financial.income ?? 0} max={Math.max(reports?.financial.income ?? 0, reports?.financial.expenses ?? 0, 1)} color="bg-primary" />
					<Bar label="Expenses" value={reports?.financial.expenses ?? 0} max={Math.max(reports?.financial.income ?? 0, reports?.financial.expenses ?? 0, 1)} color="bg-destructive" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Top expense categories</CardTitle>
					<CardDescription>Largest categories by total spend</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{categories.slice(0, 5).map((item) => <Bar key={item.category} label={item.category} value={item.total} max={maxExpense} color="bg-chart-2" />)}
					{categories.length === 0 ? <p className="text-sm text-muted-foreground">No expense data for this period.</p> : null}
				</CardContent>
			</Card>
			<Card className="xl:col-span-2">
				<CardHeader>
					<CardTitle>Product revenue</CardTitle>
					<CardDescription>Highest revenue products in the selected period</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{products.slice(0, 5).map((item, index) => <Bar key={`${item.product?.name ?? "product"}-${index}`} label={item.product?.name ?? "Unknown product"} value={item.revenue} max={maxRevenue} color="bg-chart-3" suffix={`${formatNumber(item.quantitySold)} sold`} />)}
					{products.length === 0 ? <p className="text-sm text-muted-foreground">No product data for this period.</p> : null}
				</CardContent>
			</Card>
		</div>
	)
}

function Bar({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: string; suffix?: string }) {
	return (
		<div className="min-w-0 space-y-1">
			<div className="flex min-w-0 justify-between gap-2 text-sm"><span className="truncate">{label}</span><span className="shrink-0 font-medium">{formatCurrency(value)}</span></div>
			<div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${color}`} style={{ width: `${Math.max((value / max) * 100, value ? 3 : 0)}%` }} /></div>
			{suffix ? <p className="text-xs text-muted-foreground">{suffix}</p> : null}
		</div>
	)
}