import { api } from "@/lib/api"

import type { AccountPayload, PaginatedAccountsResponse, Account } from "./accounts.types"

export async function getAccounts(params: { page?: number; limit?: number } = {}): Promise<PaginatedAccountsResponse> {
	const { data } = await api.get<PaginatedAccountsResponse>("/accounts", {
		params,
	})

	return data
}

export async function createAccount(payload: AccountPayload): Promise<{ success: boolean; message: string; data: Account }> {
	const { data } = await api.post<{ success: boolean; message: string; data: Account }>("/accounts", payload)
	return data
}

export async function updateAccount(id: string, payload: AccountPayload): Promise<{ success: boolean; message: string; data: Account }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: Account }>(`/accounts/${id}`, payload)
	return data
}

export async function deleteAccount(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/accounts/${id}`)
	return data
}
