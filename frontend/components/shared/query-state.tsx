import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QueryStateProps {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  errorMessage?: string
  onRetry?: () => void
}

export function QueryState({ isLoading, isError, isEmpty, emptyMessage = "No records found", errorMessage = "Unable to load data.", onRetry }: QueryStateProps) {
  if (isLoading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading...</CardContent></Card>
  if (isError) return <Card><CardContent className="flex items-center justify-between gap-4 p-6 text-sm text-destructive"><span className="flex items-center gap-2"><AlertCircle className="size-4" />{errorMessage}</span>{onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}</CardContent></Card>
  if (isEmpty) return <Card><CardContent className="p-6 text-sm text-muted-foreground">{emptyMessage}</CardContent></Card>
  return null
}
