export interface ReportPeriod {
	from: string
	to: string
}

export interface FinancialReportData {
	period: ReportPeriod
	income: number
	expenses: number
	netProfit: number
	incomeTransactions: number
	expenseTransactions: number
}

export interface SalesReportData {
	period: ReportPeriod
	totalSales: number
	revenue: number
	cost: number
	profit: number
}

export interface ExpenseReportData {
	period: ReportPeriod
	categories: Array<{
		category: string
		total: number
		count: number
	}>
}

export interface ProductReportData {
	period: ReportPeriod
	products: Array<{
		product: { name?: string; sku?: string; unit?: string } | null
		quantitySold: number
		revenue: number
		profit: number
	}>
}

export interface InventoryReportData {
	summary: {
		totalProducts: number
		lowStock: number
		outOfStock: number
		inventoryCost: number
		inventoryValue: number
	}
	products: Array<{
		product: {
			id: string
			name: string
			sku: string
			unit: string
		}
		quantity: number
		status: "in_stock" | "low_stock" | "out_of_stock"
		inventoryCost: number
		inventoryValue: number
	}>
}

export interface OverviewReportData {
	financial: FinancialReportData
	sales: SalesReportData
	expenses: ExpenseReportData
	products: ProductReportData
	inventory: InventoryReportData
}

export interface ReportsBundle {
	financial: FinancialReportData
	sales: SalesReportData
	expenses: ExpenseReportData
	products: ProductReportData
	inventory: InventoryReportData
	overview: OverviewReportData
}
