"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { createUser, deleteUser, getUsers, updateUser, updateUserRole } from "@/modules/users/users.api"
import type { UserPayload } from "@/modules/users/users.types"

const initialForm: UserPayload = {
	name: "",
	username: "",
	password: "",
	role: "user",
}

export default function UsersPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<UserPayload>(initialForm)

	const usersQuery = useQuery({
		queryKey: ["users", page],
		queryFn: () => getUsers({ page, limit: 10 }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: UserPayload) => editingId ? updateUser(editingId, payload) : createUser(payload),
		onSuccess: async () => {
			setEditingId(null)
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["users"] })
		},
	})

	const roleMutation = useMutation({
		mutationFn: ({ id, role }: { id: string; role: UserPayload["role"] }) => updateUserRole(id, role),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["users"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteUser(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["users"] })
		},
	})

	useEffect(() => {
		setEditingId(null)
		setForm(initialForm)
	}, [page])

	const users = usersQuery.data?.data ?? []

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		saveMutation.mutate(form)
	}

	const startEdit = (user: { _id: string; name: string; username: string; role: UserPayload["role"] }) => {
		setEditingId(user._id)
		setForm({ name: user.name, username: user.username, password: "", role: user.role })
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
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Username</label>
								<Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase() }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Password</label>
								<Input type="password" value={form.password ?? ""} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Role</label>
								<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserPayload["role"] }))}>
									<option value="user">User</option>
									<option value="admin">Admin</option>
								</select>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create user"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm) }}>Cancel</Button> : null}
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
							onPageChange={setPage}
							page={usersQuery.data?.pagination.page ?? page}
							totalPages={usersQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Username", render: (item) => item.username },
								{ head: "Role", render: (item) => (
									<select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={item.role} onChange={(event) => roleMutation.mutate({ id: item._id, role: event.target.value as UserPayload["role"] })}>
										<option value="user">User</option>
										<option value="admin">Admin</option>
									</select>
								) },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
										<Button size="sm" variant="destructive" onClick={() => {
											if (window.confirm(`Delete ${item.username}?`)) {
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