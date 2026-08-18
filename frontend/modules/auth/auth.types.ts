export type UserRole = "admin" | "user"

export interface AuthUser {
	id: string
	name: string
	username: string
	role: UserRole
}

export interface LoginInput {
	username: string
	password: string
}

export interface LoginResponse {
	success: boolean
	message: string
	data: {
		user: AuthUser
	}
}

export interface MeResponse {
	success: boolean
	data: {
		user: AuthUser
	}
}