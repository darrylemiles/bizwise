import { api } from "@/lib/api"

import type { Product, PaginatedProductsResponse, ProductPayload, StockAdjustmentPayload } from "./products.types"

export async function getProducts(params: { page?: number; limit?: number; search?: string; status?: string; category?: string } = {}): Promise<PaginatedProductsResponse> {
	const { data } = await api.get<PaginatedProductsResponse>("/products", {
		params,
	})

	return data
}

export async function createProduct(payload: ProductPayload): Promise<{ success: boolean; message: string; data: Product }> {
	const { data } = await api.post<{ success: boolean; message: string; data: Product }>("/products", payload)
	return data
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>): Promise<{ success: boolean; message: string; data: Product }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: Product }>(`/products/${id}`, payload)
	return data
}

export async function adjustProductStock(id: string, payload: StockAdjustmentPayload): Promise<{ success: boolean; message: string; data: { product: Product } }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: { product: Product } }>(`/products/${id}/stock`, payload)
	return data
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/products/${id}`)
	return data
}
