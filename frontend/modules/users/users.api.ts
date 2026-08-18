import { api } from "@/lib/api"

import type { PaginatedUsersResponse, User, UserPayload } from "./users.types"

export async function getUsers(params: { page?: number; limit?: number } = {}): Promise<PaginatedUsersResponse> {
	const { data } = await api.get<PaginatedUsersResponse>("/users", {
		params,
	})

	return data
}

export async function createUser(payload: UserPayload): Promise<{ success: boolean; message: string; data: User }> {
	const { data } = await api.post<{ success: boolean; message: string; data: User }>("/users", payload)
	return data
}

export async function updateUser(id: string, payload: Partial<UserPayload>): Promise<{ success: boolean; message: string; data: User }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: User }>(`/users/${id}`, payload)
	return data
}

export async function updateUserRole(id: string, role: UserPayload["role"]): Promise<{ success: boolean; message: string; data: User }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: User }>(`/users/${id}/role`, { role })
	return data
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/users/${id}`)
	return data
}
