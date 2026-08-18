import { api } from "@/lib/api"

import type { PaginatedTransactionsResponse, Transaction, TransactionPayload } from "./transactions.types"

export async function getTransactions(params: { page?: number; limit?: number; type?: string; account?: string; category?: string; startDate?: string; endDate?: string } = {}): Promise<PaginatedTransactionsResponse> {
	const { data } = await api.get<PaginatedTransactionsResponse>("/transactions", {
		params,
	})

	return data
}

export async function createTransaction(payload: TransactionPayload): Promise<{ success: boolean; message: string; data: Transaction }> {
	const { data } = await api.post<{ success: boolean; message: string; data: Transaction }>("/transactions", payload)
	return data
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/transactions/${id}`)
	return data
}
