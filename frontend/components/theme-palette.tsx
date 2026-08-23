"use client"

import { Palette } from "lucide-react"
import { useEffect, useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const paletteKey = "bizwise-palette"
const palettes = [
  { value: "neutral", label: "Neutral", color: "oklch(0.985 0 0)" },
  { value: "natural", label: "Natural", color: "oklch(0.55 0.04 95)" },
  { value: "ocean", label: "Ocean", color: "oklch(0.52 0.16 230)" },
  { value: "forest", label: "Forest", color: "oklch(0.48 0.14 150)" },
] as const
type PaletteName = typeof palettes[number]["value"]

export default function ThemePalette() {
  const [palette, setPalette] = useState<PaletteName>(() => {
    if (typeof window === "undefined") return "neutral"
    const stored = window.localStorage.getItem(paletteKey)
    if (stored === "neutral") return "neutral"
    return stored && palettes.some((option) => option.value === stored) ? stored as PaletteName : "neutral"
  })

  useEffect(() => {
    document.documentElement.dataset.palette = palette
    window.localStorage.setItem(paletteKey, palette)
  }, [palette])

  return (
    <Tooltip>
      <Select
        value={palette}
        onValueChange={(value) => value && setPalette(value as PaletteName)}
      >
        <TooltipTrigger render={<SelectTrigger className="h-8 w-10 justify-center gap-1 border-0 px-1" aria-label="Choose color palette" />}>
          <Palette className="size-3.5 shrink-0" />
          <SelectValue className="sr-only" />
        </TooltipTrigger>
        <SelectContent>
          {palettes.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <span
                  className="size-3 rounded-sm border border-foreground/20"
                  style={{ backgroundColor: option.color }}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <TooltipContent>Change palette</TooltipContent>
    </Tooltip>
  )
}