import { api } from "@/lib/api"

import type { Category, CategoryPayload, PaginatedCategoriesResponse } from "./categories.types"

export async function getCategories(params: { page?: number; limit?: number } = {}): Promise<PaginatedCategoriesResponse> {
	const { data } = await api.get<PaginatedCategoriesResponse>("/categories", {
		params,
	})

	return data
}

export async function createCategory(payload: CategoryPayload): Promise<{ success: boolean; message: string; data: Category }> {
	const { data } = await api.post<{ success: boolean; message: string; data: Category }>("/categories", payload)
	return data
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<{ success: boolean; message: string; data: Category }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: Category }>(`/categories/${id}`, payload)
	return data
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/categories/${id}`)
	return data
}
