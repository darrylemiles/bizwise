"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import PortalLoading from "@/app/portal/loading"
import { useAuth } from "../hooks/use-auth"

export function AuthGuard({
	children,
}: {
	children: React.ReactNode
}) {
	const router = useRouter()

	const {
		isAuthenticated,
		isLoading,
	} = useAuth()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login")
		}
	}, [
		isLoading,
		isAuthenticated,
		router,
	])

	if (isLoading) {
		return <PortalLoading />
	}

	if (!isAuthenticated) {
		return null
	}

	return children
}