export interface SaleProductRef {
	_id?: string
	name?: string
	sku?: string
	unit?: string
}

export interface SaleItem {
	product: SaleProductRef | string | null
	quantity: number
	unitPrice: number
	unitCost: number
	subtotal: number
	profit: number
}

export interface SaleAccountRef {
	_id?: string
	name?: string
	type?: string
	balance?: number
}

export interface Sale {
	_id: string
	items: SaleItem[]
	totalAmount: number
	totalCost: number
	totalProfit: number
	account: SaleAccountRef | string | null
	saleDate: string
	createdBy?: { name: string; username: string } | string
}

export interface PaginatedSalesResponse {
	success: boolean
	data: Sale[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface SalePayload {
	items: Array<{ product: string; quantity: number }>
	account: string
	saleDate?: string
}
