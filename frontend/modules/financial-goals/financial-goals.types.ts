export type FinancialGoalStatus = "active" | "completed" | "cancelled"

export interface FinancialGoalAccountRef {
	_id?: string
	name?: string
	type?: string
	balance?: number
}

export interface FinancialGoal {
	_id: string
	name: string
	description?: string
	targetAmount: number
	currentAmount: number
	deadline: string
	status: FinancialGoalStatus
	account: FinancialGoalAccountRef | string | null
	createdBy?: { name: string; username: string } | string
}

export interface PaginatedFinancialGoalsResponse {
	success: boolean
	data: FinancialGoal[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface FinancialGoalPayload {
	name: string
	description?: string
	targetAmount: number
	deadline: string
	account: string
	status?: FinancialGoalStatus
}

export interface ContributionPayload {
	amount: number
}
