"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
	Building2,
	ChevronUp,
	Settings,
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
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/modules/auth/hooks/use-auth"
import { useLogout } from "@/modules/auth/hooks/use-logout"
import {
	menuGroups,
	menuItems,
} from "@/components/layout/menu-items"

import { APP_NAME_CONFIGS } from "@/constants"

export default function AppSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const { user, isAdmin } = useAuth()
	const logoutMutation = useLogout()

	const isAccessible = (item: (typeof menuItems)[number]) => {
		if (item.access === "all") return true
		if (item.access === "admin") return isAdmin
		return false
	}

	const handleSignOut = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				router.replace("/login")
				router.refresh()
			},
		})
	}

	return (
		<Sidebar
			collapsible="icon"
			variant="inset"
		>
			{/* Brand */}
			<SidebarHeader className="border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							render={
								<Link href="/portal/dashboard" />
							}
							size="lg"
							tooltip={APP_NAME_CONFIGS.NAME}
						>
							<div className="flex items-center gap-2">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Building2 className="size-4" />
								</div>

								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{APP_NAME_CONFIGS.NAME}
									</span>

									<span className="truncate text-xs text-muted-foreground">
										{APP_NAME_CONFIGS.SHORT_DESCRIPTION}
									</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Navigation */}
			<SidebarContent>
				{menuGroups.map((group) => {
					const items = group.items.filter(isAccessible)

					if (items.length === 0) {
						return null
					}

					return (
						<SidebarGroup key={group.title}>
							<SidebarGroupLabel>
								{group.title}
							</SidebarGroupLabel>

							<SidebarGroupContent>
								<SidebarMenu>
									{items.map((item) => (
										<NavigationItem
											key={item.url}
											item={item}
											pathname={pathname}
										/>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					)
				})}
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
								<DropdownMenuGroup>
									<DropdownMenuLabel>
										My Account
									</DropdownMenuLabel>

									<DropdownMenuSeparator />

									<DropdownMenuItem
										render={
											<Link href="/portal/settings" />
										}
									>
										<Settings className="size-4" />
										<span>Settings</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>

								<DropdownMenuSeparator />

								<DropdownMenuItem onClick={handleSignOut}>
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			{/* Desktop collapse rail */}
			<SidebarRail />
		</Sidebar>
	)
}

function NavigationItem({
	item,
	pathname,
}: {
	item: (typeof menuItems)[number]
	pathname: string
}) {
	const Icon = item.icon

	const isActive =
		pathname === item.url ||
		pathname.startsWith(`${item.url}/`)

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				render={<Link href={item.url} />}
				isActive={isActive}
				tooltip={item.title}
			>
				<Icon />
				<span>{item.title}</span>
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
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()
}