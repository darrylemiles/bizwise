"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getCurrentUser } from "../auth.api"
import { clearAccessToken, getAccessToken } from "../auth-token"

export function useAuth() {
	const queryClient = useQueryClient()
	const [tokenReady, setTokenReady] = useState(false)
	const [hasToken, setHasToken] = useState(false)

	useEffect(() => {
		const syncToken = () => {
			const tokenExists = !!getAccessToken()
			setHasToken(tokenExists)

			if (!tokenExists) {
				queryClient.removeQueries({ queryKey: ["auth", "me"] })
			}
		}

		syncToken()
		setTokenReady(true)
		window.addEventListener("bizwise-auth-invalid", syncToken)

		return () => window.removeEventListener("bizwise-auth-invalid", syncToken)
	}, [queryClient])

	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: getCurrentUser,
		enabled: tokenReady && hasToken,
		retry: false,
		staleTime: 5 * 60 * 1000,
	})

	useEffect(() => {
		if (query.isError) {
			clearAccessToken()
			setHasToken(false)
		}
	}, [query.isError])

	return {
		user: query.data?.data.user ?? null,
		isLoading: !tokenReady || query.isLoading,
		isAuthenticated: !!query.data?.data.user,
		isError: query.isError,
		isAdmin: query.data?.data.user?.role === "admin",
	}
}