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
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/modules/categories/categories.api"
import type { CategoryPayload } from "@/modules/categories/categories.types"
import { categoryFormSchema, type CategoryFormValues } from "@/modules/categories/schemas/category-form.schema"
import { StatusBadge } from "@/components/shared/status-badge"

const initialForm: CategoryPayload = {
	name: "",
	description: "",
	type: "both",
}

export default function CategoriesPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
	const form = useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema), defaultValues: initialForm })

	const categoriesQuery = useQuery({
		queryKey: ["categories", page],
		queryFn: () => getCategories({ page, limit: 10 }),
	})

	const saveMutation = useMutation({
		mutationFn: (payload: CategoryPayload) => editingId ? updateCategory(editingId, payload) : createCategory(payload),
		onSuccess: async () => {
			setEditingId(null)
			form.reset(initialForm)
			toast.success(editingId ? "Category updated" : "Category created")
			await queryClient.invalidateQueries({ queryKey: ["categories"] })
		},
		onError: () => toast.error("Unable to save category"),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteCategory(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("Category deleted")
			await queryClient.invalidateQueries({ queryKey: ["categories"] })
		},
		onError: () => toast.error("Unable to delete category"),
	})

	const categories = categoriesQuery.data?.data ?? []

	const startEdit = (category: { _id: string; name: string; description: string; type: CategoryPayload["type"] }) => {
		setEditingId(category._id)
		form.reset({ name: category.name, description: category.description, type: category.type })
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
						<form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
							<FormField><FormLabel htmlFor="category-name">Name</FormLabel><Input id="category-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField>
							<FormSelect control={form.control} name="type" label="Type" options={[{ value: "both", label: "Both" }, { value: "product", label: "Product" }, { value: "expense", label: "Expense" }]} />
							<FormField><FormLabel htmlFor="category-description">Description</FormLabel><Textarea id="category-description" aria-invalid={!!form.formState.errors.description} {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField>
							<div className="flex gap-2">
								<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create category"}</Button>
								{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(initialForm) }}>Cancel</Button> : null}
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
							isError={categoriesQuery.isError}
							onRetry={() => categoriesQuery.refetch()}
												onPageChange={(nextPage) => { setPage(nextPage); setEditingId(null); form.reset(initialForm) }}
							page={categoriesQuery.data?.pagination.page ?? page}
							totalPages={categoriesQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "Type", render: (item) => <StatusBadge value={item.type} /> },
								{ head: "Updated", render: (item) => item.updatedAt ?? "-" },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
										<Button size="sm" variant="destructive" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget({ id: item._id, name: item.name })}><Trash2 className="size-4" /></Button>
									</div>
								) },
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name || "Unnamed category"}</p><p className="text-sm text-muted-foreground">{item.description || "No description"}</p></div><StatusBadge value={item.type} /></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}><Pencil className="size-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: item._id, name: item.name })} aria-label={`Delete ${item.name}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete category?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete category</Button>} /></AlertDialogFooter></AlertDialogContent>
			</AlertDialog>
		</div>
	)
}