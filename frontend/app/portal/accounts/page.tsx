"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormSelect } from "@/components/shared/form-controls"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate } from "@/lib/format"
import { getErrorMessage } from "@/lib/http-error"
import { createAccount, deleteAccount, getAccounts, updateAccount } from "@/modules/accounts/accounts.api"
import { StatusBadge } from "@/components/shared/status-badge"
import type { AccountPayload } from "@/modules/accounts/accounts.types"
import { accountFormSchema, type AccountFormValues } from "@/modules/accounts/schemas/account-form.schema"
import titleCase from "@/lib/titleCase"

const initialForm: AccountPayload = {
	name: "",
	type: "cash",
	description: "",
}

export default function AccountsPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
	const form = useForm<AccountFormValues>({ resolver: zodResolver(accountFormSchema), defaultValues: initialForm })

	const accountsQuery = useQuery({
		queryKey: ["accounts", page, pageSize],
		queryFn: () => getAccounts({ page, limit: pageSize }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: AccountPayload) => editingId ? updateAccount(editingId, payload) : createAccount(payload),
		onSuccess: async () => {
			setEditingId(null)
			form.reset(initialForm)
			toast.success(editingId ? "Account updated" : "Account created")
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to save account")),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteAccount(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("Account deleted")
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to delete account")),
	})

	const handlePageChange = (nextPage: number) => {
		setPage(nextPage)
		setEditingId(null)
		form.reset(initialForm)
	}

	const accounts = accountsQuery.data?.data ?? []

	const startEdit = (account: { _id: string; name: string; type: AccountPayload["type"]; description: string }) => {
		setEditingId(account._id)
		form.reset({ name: account.name, type: account.type, description: account.description })
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
						<form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
							<FormField><FormLabel htmlFor="account-name">Name</FormLabel><Input id="account-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField>
							<FormSelect control={form.control} name="type" label="Type" options={["cash", "bank", "e-wallet"].map((value) => ({ value, label: titleCase(value) }))} />
							<FormField><FormLabel htmlFor="account-description">Description</FormLabel><Textarea id="account-description" aria-invalid={!!form.formState.errors.description} {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField>
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create account"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(initialForm) }}>Cancel</Button> : null}
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
							isError={accountsQuery.isError}
							error={accountsQuery.error}
							onRetry={() => accountsQuery.refetch()}
								onPageChange={handlePageChange}
								onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1) }}
								pageSize={accountsQuery.data?.pagination.limit ?? pageSize}
								total={accountsQuery.data?.pagination.total ?? 0}
							page={accountsQuery.data?.pagination.page ?? page}
							totalPages={accountsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Type", render: (item) => <StatusBadge value={item.type} /> },
								{ head: "Balance", render: (item) => formatCurrency(item.balance) },
								{ head: "Updated", render: (item) => formatDate(item.updatedAt) },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
										<Button size="sm" variant="destructive" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget({ id: item._id, name: item.name })}><Trash2 className="size-4" /></Button>
									</div>
								) },
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name || "Unnamed account"}</p><p className="text-sm text-muted-foreground">{formatCurrency(item.balance)}</p></div><StatusBadge value={item.type} /></div><p className="text-sm text-muted-foreground">{item.description || "No description"}</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}><Pencil className="size-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: item._id, name: item.name })} aria-label={`Delete ${item.name}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader><AlertDialogTitle>Delete account?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.name}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete account</Button>} /></AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}