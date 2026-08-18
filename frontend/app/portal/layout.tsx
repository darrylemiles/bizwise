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
					{children}
				</SidebarInset>
			</SidebarProvider>
		</AuthGuard>
	)
}