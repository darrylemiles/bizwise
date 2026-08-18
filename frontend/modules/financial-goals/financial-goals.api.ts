import { api } from "@/lib/api"

import type { ContributionPayload, FinancialGoal, FinancialGoalPayload, PaginatedFinancialGoalsResponse } from "./financial-goals.types"

export async function getFinancialGoals(params: { page?: number; limit?: number; status?: string } = {}): Promise<PaginatedFinancialGoalsResponse> {
	const { data } = await api.get<PaginatedFinancialGoalsResponse>("/financial-goals", {
		params,
	})

	return data
}

export async function createFinancialGoal(payload: FinancialGoalPayload): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
	const { data } = await api.post<{ success: boolean; message: string; data: FinancialGoal }>("/financial-goals", payload)
	return data
}

export async function updateFinancialGoal(id: string, payload: Partial<FinancialGoalPayload>): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
	const { data } = await api.patch<{ success: boolean; message: string; data: FinancialGoal }>(`/financial-goals/${id}`, payload)
	return data
}

export async function contributeToGoal(id: string, payload: ContributionPayload): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
	const { data } = await api.post<{ success: boolean; message: string; data: FinancialGoal }>(`/financial-goals/${id}/contribute`, payload)
	return data
}

export async function deleteFinancialGoal(id: string): Promise<{ success: boolean; message: string }> {
	const { data } = await api.delete<{ success: boolean; message: string }>(`/financial-goals/${id}`)
	return data
}
