export interface DashboardSummary {
	income: number
	expenses: number
	netProfit: number
	incomeTransactions: number
	expenseTransactions: number
}

export interface DashboardAccounts {
	totalAccounts: number
	totalBalance: number
}

export interface DashboardSales {
	totalSales: number
	revenue: number
	cost: number
	profit: number
}

export interface DashboardInventory {
	totalProducts: number
	inventoryValue: number
	lowStock: number
	outOfStock: number
}

export interface DashboardFinancialGoals {
	active: number
	completed: number
	cancelled: number
	totalTargetAmount: number
	totalCurrentAmount: number
}

export interface DashboardTopProduct {
	product: {
		_id: string
		name: string
		sku: string
		unit: string
	}
	quantitySold: number
	revenue: number
	profit: number
}

export interface DashboardLowStockProduct {
	_id: string
	name: string
	sku: string
	unit: string
	quantity: number
	lowStockThreshold: number
}

export interface DashboardRecentTransaction {
	_id: string
	type: string
	amount: number
	description?: string
	date: string
	account: {
		name: string
		type: string
	}
}

export interface DashboardRecentSale {
	_id: string
	totalAmount: number
	totalProfit: number
	saleDate: string
	account: {
		name: string
		type: string
	}
	items: Array<{
		product: {
			name: string
			sku: string
			unit: string
		}
		quantity: number
		subtotal: number
		profit: number
	}>
}

export interface DashboardData {
	period: {
		from: string
		to: string
	}
	summary: DashboardSummary
	accounts: DashboardAccounts
	sales: DashboardSales
	inventory: DashboardInventory
	financialGoals: DashboardFinancialGoals
	topProducts: DashboardTopProduct[]
	lowStockProducts: DashboardLowStockProduct[]
	recentTransactions: DashboardRecentTransaction[]
	recentSales: DashboardRecentSale[]
}

export interface DashboardResponse {
	success: boolean
	data: DashboardData
}
