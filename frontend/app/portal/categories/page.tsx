"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/modules/categories/categories.api"
import type { CategoryPayload } from "@/modules/categories/categories.types"

const initialForm: CategoryPayload = {
	name: "",
	description: "",
	type: "both",
}

export default function CategoriesPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<CategoryPayload>(initialForm)

	const categoriesQuery = useQuery({
		queryKey: ["categories", page],
		queryFn: () => getCategories({ page, limit: 10 }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: CategoryPayload) => editingId ? updateCategory(editingId, payload) : createCategory(payload),
		onSuccess: async () => {
			setEditingId(null)
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["categories"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteCategory(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["categories"] })
		},
	})

	useEffect(() => {
		setEditingId(null)
		setForm(initialForm)
	}, [page])

	const categories = categoriesQuery.data?.data ?? []

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		saveMutation.mutate(form)
	}

	const startEdit = (category: { _id: string; name: string; description: string; type: CategoryPayload["type"] }) => {
		setEditingId(category._id)
		setForm({ name: category.name, description: category.description, type: category.type })
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Business setup</p>
				<h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>{editingId ? "Edit category" : "Create category"}</CardTitle>
						<CardDescription>Used by products and expense transactions.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Type</label>
								<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CategoryPayload["type"] }))}>
									<option value="both">Both</option>
									<option value="product">Product</option>
									<option value="expense">Expense</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Description</label>
								<textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create category"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm) }}>Cancel</Button> : null}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Category list</CardTitle>
						<CardDescription>Used across inventory and transactions.</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={categories}
							isLoading={categoriesQuery.isLoading}
							onPageChange={setPage}
							page={categoriesQuery.data?.pagination.page ?? page}
							totalPages={categoriesQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Type", render: (item) => item.type },
								{ head: "Updated", render: (item) => item.updatedAt ?? "-" },
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