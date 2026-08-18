"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	ArrowLeftRight,
	BarChart3,
	Building2,
	ChevronUp,
	LayoutDashboard,
	Package,
	Settings,
	ShoppingCart,
	Users,
} from "lucide-react"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/modules/auth/hooks/use-auth"

const mainNavigation = [
	{
		title: "Dashboard",
		url: "/portal/dashboard",
		icon: LayoutDashboard,
	},
]

const businessNavigation = [
	{
		title: "Products",
		url: "/portal/products",
		icon: Package,
	},
	{
		title: "Sales",
		url: "/portal/sales",
		icon: ShoppingCart,
	},
	{
		title: "Transactions",
		url: "/portal/transactions",
		icon: ArrowLeftRight,
	},
]

const analyticsNavigation = [
	{
		title: "Reports",
		url: "/portal/reports",
		icon: BarChart3,
	},
]

const adminNavigation = [
	{
		title: "Users",
		url: "/portal/users",
		icon: Users,
	},
]

export default function AppSidebar() {
	const pathname = usePathname()
	const { user } = useAuth()

	const isAdmin = user?.role === "admin"

	return (
		<Sidebar collapsible="icon" variant="inset">
			{/* Brand */}
			<SidebarHeader className="border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							tooltip="Bizwise"
						>
							<Link
								href="/portal/dashboard"
								className="flex w-full items-center gap-2"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Building2 className="size-4" />
								</div>

								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										Bizwise
									</span>

									<span className="truncate text-xs text-muted-foreground">
										Business Management
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Navigation */}
			<SidebarContent>
				{/* Overview */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Overview
					</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavigation.map((item) => (
								<NavigationItem
									key={item.url}
									item={item}
									pathname={pathname}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Business */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Business
					</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{businessNavigation.map((item) => (
								<NavigationItem
									key={item.url}
									item={item}
									pathname={pathname}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Analytics */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Analytics
					</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{analyticsNavigation.map((item) => (
								<NavigationItem
									key={item.url}
									item={item}
									pathname={pathname}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Administration */}
				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel>
							Administration
						</SidebarGroupLabel>

						<SidebarGroupContent>
							<SidebarMenu>
								{adminNavigation.map((item) => (
									<NavigationItem
										key={item.url}
										item={item}
										pathname={pathname}
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			{/* Account */}
			<SidebarFooter className="border-t">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton
										size="lg"
										tooltip="Account"
									>
										<Avatar className="size-8">
											<AvatarFallback className="bg-primary text-primary-foreground">
												{getInitials(user?.name)}
											</AvatarFallback>
										</Avatar>

										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.name ?? "User"}
											</span>

											<span className="truncate text-xs text-muted-foreground">
												{user?.username ?? ""}
											</span>
										</div>

										<ChevronUp className="ml-auto size-4" />
									</SidebarMenuButton>
								}
							/>

							<DropdownMenuContent
								side="top"
								align="start"
								className="w-56"
							>
								<DropdownMenuLabel>
									My Account
								</DropdownMenuLabel>

								<DropdownMenuSeparator />

								<DropdownMenuItem>
									<Link
										href="/portal/settings"
										className="flex w-full items-center"
									>
										<Settings className="mr-2 size-4" />
										Settings
									</Link>
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								<DropdownMenuItem>
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	)
}

function NavigationItem({
	item,
	pathname,
}: {
	item: {
		title: string
		url: string
		icon: React.ComponentType<{ className?: string }>
	}
	pathname: string
}) {
	const Icon = item.icon

	const isActive =
		pathname === item.url ||
		pathname.startsWith(`${item.url}/`)

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				isActive={isActive}
				tooltip={item.title}
			>
				<Link
					href={item.url}
					className="flex w-full items-center gap-2"
				>
					<Icon />
					<span>{item.title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}

function getInitials(name?: string) {
	if (!name) {
		return "U"
	}

	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()
}