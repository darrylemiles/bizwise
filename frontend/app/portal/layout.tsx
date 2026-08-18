"use client"

import AppHeader from "@/components/layout/app-header"
import AppSidebar from "@/components/layout/app-sidebar"
import {
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar"
import titleCase from "@/lib/titleCase"

import { AuthGuard } from "@/modules/auth/components/auth-guard"
import { usePathname } from "next/navigation"

export default function PortalLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	const pageTitle = pathname
		?.split("/")
		?.filter(Boolean)
		?.pop()

	return (
		<AuthGuard>
			<SidebarProvider>
				<AppSidebar />

				<SidebarInset>
					<AppHeader headerTitle={titleCase(pageTitle ?? "")} />

					<main className="flex flex-1 flex-col gap-4 p-4 pt-0 my-2">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</AuthGuard>
	)
}