"use client"

import type { ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TruncatedTextProps {
	children: ReactNode
	className?: string
	value?: string | null
}

export function TruncatedText({ children, className, value }: TruncatedTextProps) {
	const tooltipValue = value ?? (typeof children === "string" ? children : "")

	if (!tooltipValue) {
		return <span className={cn("block min-w-0 truncate", className)}>{children}</span>
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={<span className={cn("block min-w-0 max-w-full truncate", className)} />}
			>
				{children}
			</TooltipTrigger>
			<TooltipContent className="max-w-sm break-words">{tooltipValue}</TooltipContent>
		</Tooltip>
	)
}