"use client"

import { useMemo, useState } from "react"
import type { ComponentType } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, ArrowUpRight, Banknote, Boxes, CircleDollarSign, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField, FormLabel } from "@/components/ui/form"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { DataTable } from "@/components/data-table"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { getErrorMessage } from "@/lib/http-error"
import { getDashboard } from "@/modules/dashboard/dashboard.api"
import { StatusBadge } from "@/components/shared/status-badge"
import type { DashboardData } from "@/modules/dashboard/dashboard.types"

export default function DashboardPage() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", { from, to }],
    queryFn: () => getDashboard({ from: from || undefined, to: to || undefined }),
  })

  const dashboard = dashboardQuery.data?.data

  const topProductColumns = useMemo(() => [
    { head: "Product", render: (item: DashboardData["topProducts"][number]) => item.product ? `${item.product.name ?? "Unknown product"} (${item.product.sku ?? "No SKU"})` : "Unknown product" },
    { head: "Qty", render: (item: DashboardData["topProducts"][number]) => formatNumber(item.quantitySold) },
    { head: "Revenue", render: (item: DashboardData["topProducts"][number]) => formatCurrency(item.revenue) },
  ], [])
  const lowStockColumns = useMemo(() => [
    { head: "Product", render: (item: DashboardData["lowStockProducts"][number]) => `${item.name} (${item.sku})` },
    { head: "Remaining", render: (item: DashboardData["lowStockProducts"][number]) => formatNumber(item.quantity) },
    { head: "Threshold", render: (item: DashboardData["lowStockProducts"][number]) => formatNumber(item.lowStockThreshold) },
  ], [])
  const transactionColumns = useMemo(() => [
    { head: "Type", render: (item: DashboardData["recentTransactions"][number]) => <StatusBadge value={item.type} /> },
    { head: "Amount", render: (item: DashboardData["recentTransactions"][number]) => formatCurrency(item.amount) },
    { head: "Account", render: (item: DashboardData["recentTransactions"][number]) => item.account?.name ?? "Unknown account" },
    { head: "Date", render: (item: DashboardData["recentTransactions"][number]) => formatDate(item.date) },
  ], [])
  const saleColumns = useMemo(() => [
    { head: "Account", render: (item: DashboardData["recentSales"][number]) => item.account?.name ?? "Unknown account" },
    { head: "Amount", render: (item: DashboardData["recentSales"][number]) => formatCurrency(item.totalAmount) },
    { head: "Profit", render: (item: DashboardData["recentSales"][number]) => formatCurrency(item.totalProfit) },
    { head: "Date", render: (item: DashboardData["recentSales"][number]) => formatDate(item.saleDate) },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Financial snapshot</p>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <FormField><FormLabel className="text-xs text-muted-foreground">From</FormLabel><DatePickerField value={from} onChange={setFrom} /></FormField>
          <FormField><FormLabel className="text-xs text-muted-foreground">To</FormLabel><DatePickerField value={to} onChange={setTo} /></FormField>
          <Button variant="outline" onClick={() => dashboardQuery.refetch()}>Refresh</Button>
        </div>
      </div>

      {dashboardQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{getErrorMessage(dashboardQuery.error, "Unable to load dashboard data.")}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Revenue" value={formatCurrency(dashboard?.summary.income)} description={`${formatNumber(dashboard?.summary.incomeTransactions)} income transactions`} icon={ArrowDownLeft} />
        <MetricCard title="Expenses" value={formatCurrency(dashboard?.summary.expenses)} description={`${formatNumber(dashboard?.summary.expenseTransactions)} expense transactions`} icon={ArrowUpRight} />
        <MetricCard title="Net Profit" value={formatCurrency(dashboard?.summary.netProfit)} description="Income minus expenses" icon={CircleDollarSign} />
        <MetricCard title="Total Balance" value={formatCurrency(dashboard?.accounts.totalBalance)} description={`${formatNumber(dashboard?.accounts.totalAccounts)} accounts`} icon={Banknote} />
        <MetricCard title="Sales Revenue" value={formatCurrency(dashboard?.sales.revenue)} description={`${formatNumber(dashboard?.sales.totalSales)} sales`} icon={ShoppingCart} />
        <MetricCard title="Inventory Value" value={formatCurrency(dashboard?.inventory.inventoryValue)} description={`${formatNumber(dashboard?.inventory.totalProducts)} products`} icon={Boxes} />
        <MetricCard title="Low Stock" value={formatNumber(dashboard?.inventory.lowStock)} description="Products near threshold" icon={TrendingDown} />
        <MetricCard title="Financial Goals" value={formatNumber((dashboard?.financialGoals.active ?? 0) + (dashboard?.financialGoals.completed ?? 0) + (dashboard?.financialGoals.cancelled ?? 0))} description={`${formatNumber(dashboard?.financialGoals.completed)} completed`} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Highest revenue contributors in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={dashboard?.topProducts ?? []}
                isLoading={dashboardQuery.isLoading}
                isError={dashboardQuery.isError}
                error={dashboardQuery.error}
                onRetry={() => dashboardQuery.refetch()}
              emptyMessage="No sales yet"
              columns={topProductColumns}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products that need replenishment soon</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={dashboard?.lowStockProducts ?? []}
                isLoading={dashboardQuery.isLoading}
                isError={dashboardQuery.isError}
                error={dashboardQuery.error}
                onRetry={() => dashboardQuery.refetch()}
              emptyMessage="No low stock items"
              columns={lowStockColumns}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest ledger activity</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={dashboard?.recentTransactions ?? []}
                isLoading={dashboardQuery.isLoading}
                isError={dashboardQuery.isError}
                error={dashboardQuery.error}
                onRetry={() => dashboardQuery.refetch()}
              emptyMessage="No transactions yet"
              columns={transactionColumns}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest completed sales</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={dashboard?.recentSales ?? []}
                isLoading={dashboardQuery.isLoading}
                isError={dashboardQuery.isError}
                error={dashboardQuery.error}
                onRetry={() => dashboardQuery.refetch()}
              emptyMessage="No sales yet"
              columns={saleColumns}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  )
}