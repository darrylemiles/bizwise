"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { logout } from "../auth.api"
import { clearAccessToken } from "../auth-token"

export function useLogout() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: logout,
		onSettled: () => {
			clearAccessToken()
			queryClient.removeQueries({
				queryKey: ["auth", "me"],
			})
			queryClient.removeQueries({
				predicate: (query) => query.queryKey[0] !== "auth",
			})
		},
	})
}