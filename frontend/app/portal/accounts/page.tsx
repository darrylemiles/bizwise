"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/format"
import { createAccount, deleteAccount, getAccounts, updateAccount } from "@/modules/accounts/accounts.api"
import type { AccountPayload } from "@/modules/accounts/accounts.types"

const initialForm: AccountPayload = {
	name: "",
	type: "cash",
	description: "",
}

export default function AccountsPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<AccountPayload>(initialForm)

	const accountsQuery = useQuery({
		queryKey: ["accounts", page],
		queryFn: () => getAccounts({ page, limit: 10 }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: AccountPayload) => editingId ? updateAccount(editingId, payload) : createAccount(payload),
		onSuccess: async () => {
			setEditingId(null)
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteAccount(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
	})

	useEffect(() => {
		setEditingId(null)
		setForm(initialForm)
	}, [page])

	const accounts = accountsQuery.data?.data ?? []

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		saveMutation.mutate(form)
	}

	const startEdit = (account: { _id: string; name: string; type: AccountPayload["type"]; description: string }) => {
		setEditingId(account._id)
		setForm({ name: account.name, type: account.type, description: account.description })
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Business setup</p>
				<h2 className="text-2xl font-semibold tracking-tight">Accounts</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>{editingId ? "Edit account" : "Create account"}</CardTitle>
						<CardDescription>Accounts back transactions, sales, and goals.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Type</label>
								<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AccountPayload["type"] }))}>
									<option value="cash">Cash</option>
									<option value="bank">Bank</option>
									<option value="e-wallet">E-wallet</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Description</label>
								<textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create account"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm) }}>Cancel</Button> : null}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Account list</CardTitle>
						<CardDescription>Balances and account types from the backend.</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={accounts}
							isLoading={accountsQuery.isLoading}
							onPageChange={setPage}
							page={accountsQuery.data?.pagination.page ?? page}
							totalPages={accountsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Type", render: (item) => item.type },
								{ head: "Balance", render: (item) => formatCurrency(item.balance) },
								{ head: "Updated", render: (item) => formatDate(item.updatedAt) },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
										<Button size="sm" variant="destructive" onClick={() => {
											if (window.confirm(`Delete ${item.name}?`)) {
												removeMutation.mutate(item._id)
											}
										}}><Trash2 className="size-4" /></Button>
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