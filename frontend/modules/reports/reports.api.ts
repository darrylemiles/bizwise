import { api } from "@/lib/api"

import type {
	ExpenseReportData,
	FinancialReportData,
	InventoryReportData,
	OverviewReportData,
	ProductReportData,
	ReportsBundle,
	SalesReportData,
} from "./reports.types"

async function fetchReport<T>(path: string, params: { from?: string; to?: string }) {
	const { data } = await api.get<{ success: boolean; data: T }>(path, {
		params,
	})

	return data.data
}

export async function getReports(params: { from?: string; to?: string } = {}): Promise<ReportsBundle> {
	const [financial, sales, expenses, products, inventory, overview] = await Promise.all([
		fetchReport<FinancialReportData>("/reports/financial", params),
		fetchReport<SalesReportData>("/reports/sales", params),
		fetchReport<ExpenseReportData>("/reports/expenses", params),
		fetchReport<ProductReportData>("/reports/products", params),
		fetchReport<InventoryReportData>("/reports/inventory", params),
		fetchReport<OverviewReportData>("/reports/overview", params),
	])

	return {
		financial,
		sales,
		expenses,
		products,
		inventory,
		overview,
	}
}
