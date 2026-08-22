"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, PiggyBank, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormDatePicker, FormSelect } from "@/components/shared/form-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate } from "@/lib/format"
import { toApiDate } from "@/lib/date"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { contributeToGoal, createFinancialGoal, deleteFinancialGoal, getFinancialGoals, updateFinancialGoal } from "@/modules/financial-goals/financial-goals.api"
import type { FinancialGoalPayload } from "@/modules/financial-goals/financial-goals.types"
import { getAccounts } from "@/modules/accounts/accounts.api"
import { financialGoalFormSchema, type FinancialGoalFormValues } from "@/modules/financial-goals/schemas/financial-goal-form.schema"
import { goalContributionSchema, type GoalContributionValues } from "@/modules/financial-goals/schemas/goal-contribution.schema"
import { StatusBadge } from "@/components/shared/status-badge"

const initialForm: FinancialGoalPayload = {
	name: "",
	description: "",
	targetAmount: 0,
	deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
	account: "",
	status: "active",
}

export default function FinancialGoalsPage() {
	const queryClient = useQueryClient()
	const { isAdmin } = useAuth()
	const [page, setPage] = useState(1)
	const [status, setStatus] = useState("")
	const [editingId, setEditingId] = useState<string | null>(null)
	const [contributionTarget, setContributionTarget] = useState<{ id: string; name: string } | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
	const form = useForm<z.input<typeof financialGoalFormSchema>, unknown, FinancialGoalFormValues>({ resolver: zodResolver(financialGoalFormSchema), defaultValues: initialForm })
	const contributionForm = useForm<z.input<typeof goalContributionSchema>, unknown, GoalContributionValues>({ resolver: zodResolver(goalContributionSchema), defaultValues: { amount: 50 } })

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const goalsQuery = useQuery({ queryKey: ["financial-goals", page, status], queryFn: () => getFinancialGoals({ page, limit: 10, status: status || undefined }) })

	const accountOptions = (accountsQuery.data?.data ?? []).map((account) => ({ value: account._id, label: `${account.name} (${account.type})` }))

	const saveMutation = useMutation({
		mutationFn: (payload: FinancialGoalPayload) => editingId ? updateFinancialGoal(editingId, payload) : createFinancialGoal(payload),
		onSuccess: async () => {
			setEditingId(null)
			form.reset(initialForm)
			toast.success(editingId ? "Goal updated" : "Goal created")
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
		onError: () => toast.error("Unable to save goal"),
	})

	const contributeMutation = useMutation({
		mutationFn: ({ id, amount }: { id: string; amount: number }) => contributeToGoal(id, { amount }),
		onSuccess: async () => {
			setContributionTarget(null)
			contributionForm.reset({ amount: 50 })
			toast.success("Contribution added")
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
		onError: () => toast.error("Unable to add contribution"),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteFinancialGoal(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("Goal deleted")
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
		onError: () => toast.error("Unable to delete goal"),
	})

	const goals = goalsQuery.data?.data ?? []
	const submitGoal = (values: FinancialGoalFormValues) => {
		saveMutation.mutate({ ...values, deadline: toApiDate(values.deadline) ?? values.deadline })
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Planning</p>
				<h2 className="text-2xl font-semibold tracking-tight">Financial Goals</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>{editingId ? "Edit goal" : "Create goal"}</CardTitle>
						<CardDescription>Track savings targets against a funding account.</CardDescription>
					</CardHeader>
					<CardContent>
						{isAdmin ? (
							<form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submitGoal)}>
								<FormField className="md:col-span-2"><FormLabel htmlFor="goal-name">Name</FormLabel><Input id="goal-name" {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField>
								<FormField className="md:col-span-2"><FormLabel htmlFor="goal-description">Description</FormLabel><Textarea id="goal-description" {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField>
								<FormField><FormLabel htmlFor="goal-target">Target amount</FormLabel><Input id="goal-target" type="number" step="0.01" {...form.register("targetAmount")} /><FormMessage>{form.formState.errors.targetAmount?.message}</FormMessage></FormField>
								<FormDatePicker control={form.control} name="deadline" label="Deadline" />
								<FormSelect control={form.control} name="account" label="Account" options={accountOptions} disabled={accountsQuery.isLoading} />
								<div className="flex gap-2 md:col-span-2">
									<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create goal"}</Button>
									{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(initialForm) }}>Cancel</Button> : null}
								</div>
							</form>
						) : (
							<p className="text-sm text-muted-foreground">Only admins can create or edit goals.</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Goal list</CardTitle>
						<CardDescription>Track target progress and receive contributions.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Select value={status} onValueChange={(value) => setStatus(value ?? "")}><SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
						</div>

						<DataTable
							data={goals}
							isLoading={goalsQuery.isLoading}
							isError={goalsQuery.isError}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name || "Unnamed goal"}</p><p className="text-sm text-muted-foreground">{formatCurrency(item.currentAmount)} / {formatCurrency(item.targetAmount)}</p></div><StatusBadge value={item.status} /></div><p className="text-sm text-muted-foreground">Deadline: {formatDate(item.deadline)}</p><div className="flex gap-2"><Button size="sm" variant="outline" aria-label={`Contribute to ${item.name}`} onClick={() => setContributionTarget({ id: item._id, name: item.name })}><PiggyBank className="size-4" /></Button>{isAdmin ? <Button size="sm" variant="outline" aria-label={`Edit ${item.name}`} onClick={() => { setEditingId(item._id); form.reset({ name: item.name, description: item.description ?? "", targetAmount: item.targetAmount, deadline: item.deadline.slice(0, 10), account: typeof item.account === "string" ? item.account : item.account?._id ?? "", status: item.status }) }}><Pencil className="size-4" /></Button> : null}{isAdmin ? <Button size="sm" variant="destructive" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget({ id: item._id, name: item.name })}><Trash2 className="size-4" /></Button> : null}</div></CardContent></Card>}
							onRetry={() => goalsQuery.refetch()}
							onPageChange={(nextPage) => { setPage(nextPage); setEditingId(null); form.reset(initialForm) }}
							page={goalsQuery.data?.pagination.page ?? page}
							totalPages={goalsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Goal", render: (item) => item.name },
								{ head: "Progress", render: (item) => `${formatCurrency(item.currentAmount)} / ${formatCurrency(item.targetAmount)}` },
								{ head: "Status", render: (item) => <StatusBadge value={item.status} /> },
								{ head: "Deadline", render: (item) => formatDate(item.deadline) },
								{
									head: "Actions", render: (item) => (
										<div className="flex gap-2">
											<Button size="sm" variant="outline" aria-label={`Contribute to ${item.name}`} onClick={() => setContributionTarget({ id: item._id, name: item.name })}><PiggyBank className="size-4" /></Button>
											{isAdmin ? <Button size="sm" variant="outline" onClick={() => {
												setEditingId(item._id)
												form.reset({
													name: item.name,
													description: item.description ?? "",
													targetAmount: item.targetAmount,
													deadline: item.deadline.slice(0, 10),
													account: typeof item.account === "string" ? item.account : item.account?._id ?? "",
													status: item.status,
												})
											}} aria-label={`Edit ${item.name}`}><Pencil className="size-4" /></Button> : null}
											{isAdmin ? <Button size="sm" variant="destructive" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget({ id: item._id, name: item.name })}><Trash2 className="size-4" /></Button> : null}
										</div>
									)
								},
							]}
						/>
					</CardContent>
				</Card>
			</div>
			<Dialog open={!!contributionTarget} onOpenChange={(open) => !open && setContributionTarget(null)}><DialogContent><DialogHeader><DialogTitle>Add contribution</DialogTitle><DialogDescription>{contributionTarget?.name}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={contributionForm.handleSubmit((values) => contributionTarget && contributeMutation.mutate({ id: contributionTarget.id, amount: values.amount }))}><FormField><FormLabel htmlFor="contribution-amount">Amount</FormLabel><Input id="contribution-amount" type="number" step="0.01" {...contributionForm.register("amount")} /><FormMessage>{contributionForm.formState.errors.amount?.message}</FormMessage></FormField><DialogFooter><Button type="submit" disabled={contributeMutation.isPending}>Add contribution</Button></DialogFooter></form></DialogContent></Dialog>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete goal?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete goal</Button>} /></AlertDialogFooter></AlertDialogContent></AlertDialog>
		</div>
	)
}