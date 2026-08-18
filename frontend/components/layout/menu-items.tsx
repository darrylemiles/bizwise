import {
	ArrowLeftRight,
	BarChart3,
	Building2,
	LayoutDashboard,
	Package,
	ShoppingCart,
	Users,
} from "lucide-react"

export type MenuAccess = "all" | "admin"

export type MenuGroup =
	| "Overview"
	| "Business"
	| "Analytics"
	| "Administration"

export const menuItems = [
	{
		icon: LayoutDashboard,
		access: "all",
		title: "Dashboard",
		group: "Overview",
		url: "/portal/dashboard",
	},
	{
		icon: Package,
		access: "all",
		title: "Products",
		group: "Business",
		url: "/portal/products",
	},
	{
		icon: ShoppingCart,
		access: "all",
		title: "Sales",
		group: "Business",
		url: "/portal/sales",
	},
	{
		icon: ArrowLeftRight,
		access: "all",
		title: "Transactions",
		group: "Business",
		url: "/portal/transactions",
	},
	{
		icon: BarChart3,
		access: "all",
		title: "Reports",
		group: "Analytics",
		url: "/portal/reports",
	},
	{
		icon: Users,
		access: "admin",
		title: "Users",
		group: "Administration",
		url: "/portal/users",
	},
] as const

export const menuGroups: MenuGroup[] = [
	"Overview",
	"Business",
	"Analytics",
	"Administration",
]