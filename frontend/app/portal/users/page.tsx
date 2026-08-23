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
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormSelect } from "@/components/shared/form-controls"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { createUser, deleteUser, getUsers, updateUser } from "@/modules/users/users.api"
import type { UserPayload } from "@/modules/users/users.types"
import { userFormSchema, type UserFormValues } from "@/modules/users/schemas/user-form.schema"
import { getErrorMessage } from "@/lib/http-error"
import { StatusBadge } from "@/components/shared/status-badge"

const initialForm: UserPayload = {
	name: "",
	username: "",
	password: "",
	role: "user",
}

export default function UsersPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; username: string } | null>(null)
	const form = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues: initialForm })

	const usersQuery = useQuery({
		queryKey: ["users", page, pageSize],
		queryFn: () => getUsers({ page, limit: pageSize }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: UserPayload) => editingId ? updateUser(editingId, payload) : createUser(payload),
		onSuccess: async () => {
			setEditingId(null)
			form.reset(initialForm)
			toast.success(editingId ? "User updated" : "User created")
			await queryClient.invalidateQueries({ queryKey: ["users"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to save user")),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteUser(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("User deleted")
			await queryClient.invalidateQueries({ queryKey: ["users"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to delete user")),
	})

	const users = usersQuery.data?.data ?? []

	const startEdit = (user: { _id: string; name: string; username: string; role: UserPayload["role"] }) => {
		setEditingId(user._id)
		form.reset({ name: user.name, username: user.username, password: "", role: user.role })
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Administration</p>
				<h2 className="text-2xl font-semibold tracking-tight">Users</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>{editingId ? "Edit user" : "Create user"}</CardTitle>
						<CardDescription>Admin-only user management.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
							<FormField><FormLabel htmlFor="user-name">Name</FormLabel><Input id="user-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField>
							<FormField><FormLabel htmlFor="user-username">Username</FormLabel><Input id="user-username" aria-invalid={!!form.formState.errors.username} {...form.register("username", { onChange: (event) => { event.target.value = event.target.value.toLowerCase() } })} /><FormMessage>{form.formState.errors.username?.message}</FormMessage></FormField>
							<FormField><FormLabel htmlFor="user-password">Password</FormLabel><Input id="user-password" type="password" aria-invalid={!!form.formState.errors.password} {...form.register("password")} /><FormMessage>{form.formState.errors.password?.message}</FormMessage></FormField>
							<FormSelect control={form.control} name="role" label="Role" options={[{ value: "user", label: "User" }, { value: "admin", label: "Admin" }]} />
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create user"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(initialForm) }}>Cancel</Button> : null}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User list</CardTitle>
						<CardDescription>Manage backend users and roles.</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={users}
							isLoading={usersQuery.isLoading}
							isError={usersQuery.isError}
							error={usersQuery.error}
							onRetry={() => usersQuery.refetch()}
							onPageChange={(nextPage) => { setPage(nextPage); setEditingId(null); form.reset(initialForm) }}
							onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1) }}
							pageSize={usersQuery.data?.pagination.limit ?? pageSize}
							total={usersQuery.data?.pagination.total ?? 0}
							page={usersQuery.data?.pagination.page ?? page}
							totalPages={usersQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Username", render: (item) => item.username },
								{
									head: "Role", render: (item) => (
										<div className="flex items-center gap-2"><StatusBadge value={item.role} />
										</div>
									)
								},
								{
									head: "Actions", render: (item) => (
										<div className="flex gap-2">
											<Button size="sm" variant="outline" aria-label={`Edit ${item.username}`} onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
											<Button size="sm" variant="destructive" aria-label={`Delete ${item.username}`} onClick={() => setDeleteTarget({ id: item._id, username: item.username })}><Trash2 className="size-4" /></Button>
										</div>
									)
								},
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name || "Unnamed user"}</p><p className="text-sm text-muted-foreground">{item.username || "No username"}</p></div><StatusBadge value={item.role} /></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => startEdit(item)} aria-label={`Edit ${item.username}`}><Pencil className="size-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: item._id, username: item.username })} aria-label={`Delete ${item.username}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete user?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.username}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete user</Button>} /></AlertDialogFooter></AlertDialogContent></AlertDialog>
		</div>
	)
}