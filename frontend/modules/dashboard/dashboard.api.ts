import { api } from "@/lib/api"

import type { DashboardResponse } from "./dashboard.types"

export async function getDashboard(params: { from?: string; to?: string } = {}): Promise<DashboardResponse> {
	const { data } = await api.get<DashboardResponse>("/dashboard", {
		params,
	})

	return data
}
