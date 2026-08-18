"use client"

import {
	useMutation,
	useQueryClient,
} from "@tanstack/react-query"

import { login } from "../auth.api"
import type { LoginInput } from "../auth.types"

export function useLogin() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: LoginInput) => login(data),

		onSuccess: (response) => {
			queryClient.setQueryData(
				["auth", "me"],
				response,
			)
		},
	})
}