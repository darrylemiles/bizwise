"use client"

import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { RemoteSelect } from "@/components/remote-select"
import { formatCurrency, formatDate } from "@/lib/format"
import { createTransaction, deleteTransaction, getTransactions } from "@/modules/transactions/transactions.api"
import type { TransactionPayload, TransactionType } from "@/modules/transactions/transactions.types"
import { getAccounts } from "@/modules/accounts/accounts.api"
import { getCategories } from "@/modules/categories/categories.api"

const initialForm: TransactionPayload = {
	type: "income",
	amount: 0,
	account: "",
	destinationAccount: "",
	category: "",
	description: "",
	reference: "",
	date: new Date().toISOString().slice(0, 10),
}

export default function TransactionsPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [filters, setFilters] = useState({ type: "", account: "", category: "" })
	const [form, setForm] = useState<TransactionPayload>(initialForm)

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const categoriesQuery = useQuery({ queryKey: ["categories", "lookup"], queryFn: () => getCategories({ page: 1, limit: 100 }) })
	const transactionsQuery = useQuery({ queryKey: ["transactions", page, filters], queryFn: () => getTransactions({ page, limit: 10, type: filters.type || undefined, account: filters.account || undefined, category: filters.category || undefined }) })

	const accountOptions = useMemo(() => (accountsQuery.data?.data ?? []).map((account) => ({ value: account._id, label: `${account.name} (${account.type})` })), [accountsQuery.data])
	const categoryOptions = useMemo(() => (categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name })), [categoriesQuery.data])

	const saveMutation = useMutation({
		mutationFn: (payload: TransactionPayload) => createTransaction(payload),
		onSuccess: async () => {
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["transactions"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteTransaction(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["transactions"] })
		},
	})

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const payload: TransactionPayload = {
			...form,
			amount: Number(form.amount),
			date: form.date || undefined,
			destinationAccount: form.type === "transfer" ? form.destinationAccount || undefined : undefined,
			category: form.type === "income" || form.type === "expense" ? form.category || undefined : undefined,
		}
		saveMutation.mutate(payload)
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Ledger</p>
				<h2 className="text-2xl font-semibold tracking-tight">Transactions</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>Create transaction</CardTitle>
						<CardDescription>Income, expenses, loans, capital, and transfers all post to accounts.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Type</label>
								<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as TransactionType }))}>
									<option value="income">Income</option>
									<option value="expense">Expense</option>
									<option value="loan">Loan</option>
									<option value="capital">Capital</option>
									<option value="transfer">Transfer</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Amount</label>
								<Input type="number" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Date</label>
								<Input type="date" value={form.date ?? ""} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
							</div>
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Account</label>
								<RemoteSelect options={accountOptions} value={form.account} onChange={(event) => setForm((current) => ({ ...current, account: event.target.value }))} isLoading={accountsQuery.isLoading} />
							</div>
							{form.type === "transfer" ? (
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Destination account</label>
									<RemoteSelect options={accountOptions} value={form.destinationAccount ?? ""} onChange={(event) => setForm((current) => ({ ...current, destinationAccount: event.target.value }))} isLoading={accountsQuery.isLoading} />
								</div>
							) : null}
							{form.type === "income" || form.type === "expense" ? (
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Category</label>
									<RemoteSelect options={categoryOptions} value={form.category ?? ""} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} isLoading={categoriesQuery.isLoading} />
								</div>
							) : null}
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Description</label>
								<textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
							</div>
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium">Reference</label>
								<Input value={form.reference ?? ""} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} />
							</div>
							<div className="md:col-span-2">
								<Button type="submit" className="w-full" disabled={saveMutation.isPending}>Create transaction</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Transaction list</CardTitle>
						<CardDescription>Filter and review account movement.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3 md:grid-cols-3">
							<select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}>
								<option value="">All types</option>
								<option value="income">Income</option>
								<option value="expense">Expense</option>
								<option value="loan">Loan</option>
								<option value="capital">Capital</option>
								<option value="transfer">Transfer</option>
							</select>
							<RemoteSelect options={accountOptions} value={filters.account} onChange={(event) => setFilters((current) => ({ ...current, account: event.target.value }))} placeholder="All accounts" isLoading={accountsQuery.isLoading} />
							<RemoteSelect options={categoryOptions} value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} placeholder="All categories" isLoading={categoriesQuery.isLoading} />
						</div>

						<DataTable
							data={transactionsQuery.data?.data ?? []}
							isLoading={transactionsQuery.isLoading}
							onPageChange={setPage}
							page={transactionsQuery.data?.pagination.page ?? page}
							totalPages={transactionsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Type", render: (item) => item.type },
								{ head: "Amount", render: (item) => formatCurrency(item.amount) },
								{ head: "Account", render: (item) => typeof item.account === "string" ? item.account : item.account.name },
								{ head: "Category", render: (item) => item.category ? (typeof item.category === "string" ? item.category : item.category.name) : "-" },
								{ head: "Date", render: (item) => formatDate(item.date) },
								{ head: "Actions", render: (item) => (
									<Button size="sm" variant="destructive" onClick={() => {
										if (window.confirm("Delete this transaction?")) {
											removeMutation.mutate(item._id)
										}
									}}><Trash2 className="size-4" /></Button>
								) },
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}