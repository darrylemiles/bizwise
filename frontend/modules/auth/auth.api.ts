import { api } from "@/lib/api"

import type {
	LoginInput,
	LoginResponse,
	MeResponse,
} from "./auth.types"

export async function login(
	input: LoginInput,
): Promise<LoginResponse> {
	const { data } = await api.post<LoginResponse>(
		"/users/login",
		input,
	)

	return data
}

export async function getCurrentUser(): Promise<MeResponse> {
	const { data } = await api.get<MeResponse>(
		"/users/me",
	)

	return data
}

export async function logout(): Promise<{ success: boolean; message: string }> {
	const { data } = await api.post<{ success: boolean; message: string }>(
		"/users/logout",
	)

	return data
}