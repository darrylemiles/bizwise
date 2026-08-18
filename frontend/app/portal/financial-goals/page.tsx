"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, PiggyBank, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { RemoteSelect } from "@/components/remote-select"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { contributeToGoal, createFinancialGoal, deleteFinancialGoal, getFinancialGoals, updateFinancialGoal } from "@/modules/financial-goals/financial-goals.api"
import type { FinancialGoalPayload } from "@/modules/financial-goals/financial-goals.types"
import { getAccounts } from "@/modules/accounts/accounts.api"

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
	const [form, setForm] = useState<FinancialGoalPayload>(initialForm)

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const goalsQuery = useQuery({ queryKey: ["financial-goals", page, status], queryFn: () => getFinancialGoals({ page, limit: 10, status: status || undefined }) })

	const accountOptions = (accountsQuery.data?.data ?? []).map((account) => ({ value: account._id, label: `${account.name} (${account.type})` }))

	const saveMutation = useMutation({
		mutationFn: (payload: FinancialGoalPayload) => editingId ? updateFinancialGoal(editingId, payload) : createFinancialGoal(payload),
		onSuccess: async () => {
			setEditingId(null)
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
	})

	const contributeMutation = useMutation({
		mutationFn: ({ id, amount }: { id: string; amount: number }) => contributeToGoal(id, { amount }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteFinancialGoal(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
		},
	})

	useEffect(() => {
		setEditingId(null)
		setForm(initialForm)
	}, [page])

	const goals = goalsQuery.data?.data ?? []

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		saveMutation.mutate({
			...form,
			targetAmount: Number(form.targetAmount),
		})
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
							<form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Name</label>
									<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Description</label>
									<textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Target amount</label>
									<Input type="number" step="0.01" value={form.targetAmount} onChange={(event) => setForm((current) => ({ ...current, targetAmount: Number(event.target.value) }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Deadline</label>
									<Input type="date" value={form.deadline} onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))} />
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Account</label>
									<RemoteSelect options={accountOptions} value={form.account} onChange={(event) => setForm((current) => ({ ...current, account: event.target.value }))} isLoading={accountsQuery.isLoading} />
								</div>
								<div className="flex gap-2 md:col-span-2">
									<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create goal"}</Button>
									{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm) }}>Cancel</Button> : null}
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
							<select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
								<option value="">All statuses</option>
								<option value="active">Active</option>
								<option value="completed">Completed</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>

						<DataTable
							data={goals}
							isLoading={goalsQuery.isLoading}
							onPageChange={setPage}
							page={goalsQuery.data?.pagination.page ?? page}
							totalPages={goalsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Goal", render: (item) => item.name },
								{ head: "Progress", render: (item) => `${formatCurrency(item.currentAmount)} / ${formatCurrency(item.targetAmount)}` },
								{ head: "Status", render: (item) => item.status },
								{ head: "Deadline", render: (item) => formatDate(item.deadline) },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => {
											const amount = Number(window.prompt(`Contribute to ${item.name}:`, "50"))
											if (!Number.isNaN(amount) && amount > 0) {
												contributeMutation.mutate({ id: item._id, amount })
											}
										}}><PiggyBank className="size-4" /></Button>
										{isAdmin ? <Button size="sm" variant="outline" onClick={() => {
											setEditingId(item._id)
											setForm({
												name: item.name,
												description: item.description ?? "",
												targetAmount: item.targetAmount,
												deadline: item.deadline.slice(0, 10),
												account: typeof item.account === "string" ? item.account : item.account._id,
												status: item.status,
											})
										}}><Pencil className="size-4" /></Button> : null}
										{isAdmin ? <Button size="sm" variant="destructive" onClick={() => {
											if (window.confirm(`Delete ${item.name}?`)) {
												removeMutation.mutate(item._id)
											}
										}}><Trash2 className="size-4" /></Button> : null}
									</div>
								) },
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}