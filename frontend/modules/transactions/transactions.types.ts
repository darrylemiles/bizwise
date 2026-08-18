export type TransactionType = "income" | "expense" | "loan" | "capital" | "transfer"

export interface AccountRef {
	_id: string
	name: string
	type: string
	balance?: number
}

export interface CategoryRef {
	_id: string
	name: string
}

export interface Transaction {
	_id: string
	type: TransactionType
	amount: number
	account: AccountRef | string
	destinationAccount: AccountRef | string | null
	category: CategoryRef | string | null
	description?: string
	reference?: string
	date: string
	createdBy?: { name: string; username: string } | string
}

export interface PaginatedTransactionsResponse {
	success: boolean
	data: Transaction[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface TransactionPayload {
	type: TransactionType
	amount: number
	account: string
	destinationAccount?: string
	category?: string
	description?: string
	reference?: string
	date?: string
}
