export interface LoginInput {
  username: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: {
    id: string
    name: string
    username: string
    role: string
  }
}

export type UserRole = "admin" | "user"

export interface AuthUser {
  id: string
  name: string
  username: string
  role: UserRole
}

export interface MeResponse {
  user: AuthUser
}