"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormDatePicker, FormNumericInput, FormSelect } from "@/components/shared/form-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate } from "@/lib/format"
import { getErrorMessage } from "@/lib/http-error"
import { createTransaction, deleteTransaction, getTransactions } from "@/modules/transactions/transactions.api"
import type { TransactionPayload } from "@/modules/transactions/transactions.types"
import { getAccounts } from "@/modules/accounts/accounts.api"
import { getCategories } from "@/modules/categories/categories.api"
import { transactionFormSchema, type TransactionFormValues } from "@/modules/transactions/schemas/transaction-form.schema"
import { StatusBadge } from "@/components/shared/status-badge"
import titleCase from "@/lib/titleCase"

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
	const [pageSize, setPageSize] = useState(10)
	const [filters, setFilters] = useState({ type: "", account: "", category: "" })
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
	const form = useForm<z.input<typeof transactionFormSchema>, unknown, TransactionFormValues>({ resolver: zodResolver(transactionFormSchema), defaultValues: initialForm })

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const categoriesQuery = useQuery({ queryKey: ["categories", "lookup"], queryFn: () => getCategories({ page: 1, limit: 100 }) })
	const transactionsQuery = useQuery({ queryKey: ["transactions", page, pageSize, filters], queryFn: () => getTransactions({ page, limit: pageSize, type: filters.type || undefined, account: filters.account || undefined, category: filters.category || undefined }) })

	const accountOptions = useMemo(() => (accountsQuery.data?.data ?? []).map((account) => ({ value: account._id, label: `${account.name} (${account.type})` })), [accountsQuery.data])
	const categoryOptions = useMemo(() => (categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name })), [categoriesQuery.data])

	const saveMutation = useMutation({
		mutationFn: (payload: TransactionPayload) => createTransaction(payload),
		onSuccess: async () => {
			form.reset(initialForm)
			toast.success("Transaction created")
			await queryClient.invalidateQueries({ queryKey: ["transactions"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to create transaction")),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteTransaction(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("Transaction deleted")
			await queryClient.invalidateQueries({ queryKey: ["transactions"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to delete transaction")),
	})

	const selectedType = useWatch({ control: form.control, name: "type" })
	const handleSubmit = (values: TransactionFormValues) => {
		const payload: TransactionPayload = {
			...values,
			date: values.date || undefined,
			destinationAccount: values.type === "transfer" ? values.destinationAccount || undefined : undefined,
			category: values.type === "income" || values.type === "expense" ? values.category || undefined : undefined,
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
						<form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)}>
							<FormSelect control={form.control} name="type" label="Type" options={["income", "expense", "loan", "capital", "transfer"].map((value) => ({ value, label: titleCase(value) }))} />
							<FormNumericInput control={form.control} name="amount" id="transaction-amount" label="Amount" step="0.01" />
							<FormDatePicker control={form.control} name="date" label="Date" />
							<FormSelect control={form.control} name="account" label="Account" options={accountOptions} disabled={accountsQuery.isLoading} />
							{selectedType === "transfer" ? (
								<FormSelect control={form.control} name="destinationAccount" label="Destination account" options={accountOptions} disabled={accountsQuery.isLoading} />
							) : null}
							{selectedType === "income" || selectedType === "expense" ? (
								<FormSelect control={form.control} name="category" label="Category" options={categoryOptions} disabled={categoriesQuery.isLoading} />
							) : null}
							<FormField className="md:col-span-2"><FormLabel htmlFor="transaction-description">Description</FormLabel><Textarea id="transaction-description" {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField>
							<FormField className="md:col-span-2"><FormLabel htmlFor="transaction-reference">Reference</FormLabel><Input id="transaction-reference" {...form.register("reference")} /><FormMessage>{form.formState.errors.reference?.message}</FormMessage></FormField>
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
							<Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value ?? "" }))}><SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger><SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem><SelectItem value="loan">Loan</SelectItem><SelectItem value="capital">Capital</SelectItem><SelectItem value="transfer">Transfer</SelectItem></SelectContent></Select>
							<Select value={filters.account} onValueChange={(value) => setFilters((current) => ({ ...current, account: value ?? "" }))}><SelectTrigger><SelectValue placeholder="All accounts" /></SelectTrigger><SelectContent>{accountOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
							<Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value ?? "" }))}><SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent>{categoryOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
						</div>

						<DataTable
							data={transactionsQuery.data?.data ?? []}
							isLoading={transactionsQuery.isLoading}
							isError={transactionsQuery.isError}
							error={transactionsQuery.error}
							onRetry={() => transactionsQuery.refetch()}
							onPageChange={setPage}
							onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1) }}
							pageSize={transactionsQuery.data?.pagination.limit ?? pageSize}
							total={transactionsQuery.data?.pagination.total ?? 0}
							page={transactionsQuery.data?.pagination.page ?? page}
							totalPages={transactionsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Type", render: (item) => <StatusBadge value={item.type} /> },
								{ head: "Amount", render: (item) => formatCurrency(item.amount) },
								{ head: "Account", render: (item) => typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account" },
								{ head: "Category", render: (item) => item.category ? (typeof item.category === "string" ? item.category : item.category.name) : "-" },
								{ head: "Date", render: (item) => formatDate(item.date) },
								{ head: "Actions", render: (item) => (
									<Button size="sm" variant="destructive" aria-label="Delete transaction" onClick={() => setDeleteTarget(item._id)}><Trash2 className="size-4" /></Button>
								) },
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><StatusBadge value={item.type} /><p className="mt-2 text-lg font-semibold">{formatCurrency(item.amount)}</p></div><p className="text-sm text-muted-foreground">{formatDate(item.date)}</p></div><p className="text-sm">{typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account"}</p><p className="text-sm text-muted-foreground">{item.description || "No description"}</p><Button size="sm" variant="destructive" aria-label="Delete transaction" onClick={() => setDeleteTarget(item._id)}><Trash2 className="mr-1 size-4" />Delete</Button></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete transaction?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget)}>Delete transaction</Button>} /></AlertDialogFooter></AlertDialogContent></AlertDialog>
		</div>
	)
}