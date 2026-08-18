export interface Category {
	_id: string
	name: string
	description: string
	type: "product" | "expense" | "both"
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

export interface PaginatedCategoriesResponse {
	success: boolean
	data: Category[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface CategoryPayload {
	name: string
	description?: string
	type: Category["type"]
}
