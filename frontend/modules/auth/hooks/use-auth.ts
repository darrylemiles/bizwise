"use client"

import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "../auth.api"

export function useAuth() {
	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: getCurrentUser,
		retry: false,
		staleTime: 5 * 60 * 1000,
	})

	return {
		user: query.data?.user ?? null,
		isLoading: query.isLoading,
		isAuthenticated: !!query.data?.user,
		isError: query.isError,
	}
}