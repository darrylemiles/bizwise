import { ArrowLeftRight, BarChart3, LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react"

export type MenuAccess = "all" | "admin"

export type MenuGroupName = "Overview" | "Business" | "Analytics" | "Administration"

type IconType = any

export type MenuItem = {
	icon: IconType
	access: MenuAccess
	title: string
	url: string
}

export type MenuGroup = {
	title: MenuGroupName
	items: MenuItem[]
}

export const menuGroups: MenuGroup[] = [
	{
		title: "Overview",
		items: [
			{
				icon: LayoutDashboard,
				access: "all",
				title: "Dashboard",
				url: "/portal/dashboard",
			},
		],
	},

	{
		title: "Business",
		items: [
			{
				icon: Package,
				access: "all",
				title: "Products",
				url: "/portal/products",
			},
			{
				icon: ShoppingCart,
				access: "all",
				title: "Sales",
				url: "/portal/sales",
			},
			{
				icon: ArrowLeftRight,
				access: "all",
				title: "Transactions",
				url: "/portal/transactions",
			},
		],
	},

	{
		title: "Analytics",
		items: [
			{
				icon: BarChart3,
				access: "all",
				title: "Reports",
				url: "/portal/reports",
			},
		],
	},

	{
		title: "Administration",
		items: [
			{
				icon: Users,
				access: "admin",
				title: "Users",
				url: "/portal/users",
			},
		],
	},
]

export const menuItems = menuGroups.flatMap((group) => group.items)