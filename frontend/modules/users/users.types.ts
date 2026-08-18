export type UserRole = "admin" | "user"

export interface User {
	_id: string
	id?: string
	name: string
	username: string
	role: UserRole
	createdAt?: string
	updatedAt?: string
}

export interface PaginatedUsersResponse {
	success: boolean
	data: User[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export interface UserPayload {
	name: string
	username: string
	password?: string
	role?: UserRole
}
