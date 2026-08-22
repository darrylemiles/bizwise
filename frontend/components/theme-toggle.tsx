"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme()

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark")
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" />}>{resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
			</TooltipTrigger>
			<TooltipContent>Toggle theme</TooltipContent>
		</Tooltip>
	)
}