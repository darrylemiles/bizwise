import AppHeader from "@/components/layout/app-header"
import AppSidebar from "@/components/layout/app-sidebar"
import {
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar"

import { AuthGuard } from "@/modules/auth/components/auth-guard"

export default function PortalLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<AuthGuard>
			<SidebarProvider>
				<AppSidebar />

				<SidebarInset>
					<AppHeader />

					<main className="flex flex-1 flex-col gap-4 p-4 pt-0">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</AuthGuard>
	)
}