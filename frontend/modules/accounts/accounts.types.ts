export interface Account {
	_id: string
	name: string
	type: "cash" | "bank" | "e-wallet"
	description: string
	balance: number
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

export interface PaginatedAccountsResponse {
	success: boolean
	data: Account[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface AccountPayload {
	name: string
	type: Account["type"]
	description?: string
}
