import { api } from "@/lib/api"

import type { PaginatedSalesResponse, Sale, SalePayload } from "./sales.types"

export async function getSales(params: { page?: number; limit?: number } = {}): Promise<PaginatedSalesResponse> {
	const { data } = await api.get<PaginatedSalesResponse>("/sales", {
		params,
	})

	return data
}

export async function createSale(payload: SalePayload): Promise<{ success: boolean; message: string; data: Sale }> {
	const { data } = await api.post<{ success: boolean; message: string; data: Sale }>("/sales", payload)
	return data
}
