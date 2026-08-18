export type ProductStatus = "active" | "inactive"

export interface ProductCategoryRef {
	_id: string
	name: string
	type?: string
}

export interface Product {
	_id: string
	name: string
	sku: string
	category: ProductCategoryRef | string
	unitType: "count" | "weight" | "volume"
	unit: "piece" | "box" | "pack" | "sack" | "gram" | "kilogram" | "milliliter" | "liter"
	costPrice: number
	sellingPrice: number
	quantity: number
	lowStockThreshold: number
	status: ProductStatus
	createdAt?: string
	updatedAt?: string
}

export interface PaginatedProductsResponse {
	success: boolean
	data: Product[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface ProductPayload {
	name: string
	category: string
	unitType: Product["unitType"]
	unit: Product["unit"]
	costPrice: number
	sellingPrice: number
	quantity: number
	lowStockThreshold: number
	status?: ProductStatus
}

export interface StockAdjustmentPayload {
	quantity: number
	reason: string
}
