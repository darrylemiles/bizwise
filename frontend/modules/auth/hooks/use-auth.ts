"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getCurrentUser } from "../auth.api"
import { clearAccessToken, getAccessToken } from "../auth-token"

function subscribeToTokenChanges(callback: () => void) {
	window.addEventListener("storage", callback)
	window.addEventListener("bizwise-auth-invalid", callback)

	return () => {
		window.removeEventListener("storage", callback)
		window.removeEventListener("bizwise-auth-invalid", callback)
	}
}

export function useAuth() {
	const queryClient = useQueryClient()
	const hasToken = useSyncExternalStore(
		subscribeToTokenChanges,
		() => !!getAccessToken(),
		() => false,
	)

	useEffect(() => {
		if (!hasToken) {
			queryClient.removeQueries({ queryKey: ["auth", "me"] })
		}
	}, [hasToken, queryClient])

	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: getCurrentUser,
		enabled: hasToken,
		retry: false,
		staleTime: 5 * 60 * 1000,
	})

	useEffect(() => {
		if (query.isError) {
			clearAccessToken()
			queryClient.removeQueries({ queryKey: ["auth", "me"] })
		}
	}, [query.isError, queryClient])

	return {
		user: query.data?.data.user ?? null,
		isLoading: !hasToken || query.isLoading,
		isAuthenticated: !!query.data?.data.user,
		isError: query.isError,
		isAdmin: query.data?.data.user?.role === "admin",
	}
}