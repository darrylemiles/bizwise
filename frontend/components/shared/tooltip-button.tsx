"use client"

import type { ReactNode } from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipButtonProps extends ButtonProps {
	tooltip: string
	children: ReactNode
}

export function TooltipButton({ tooltip, children, ...props }: TooltipButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger render={<Button {...props}>{children}</Button>} />
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}