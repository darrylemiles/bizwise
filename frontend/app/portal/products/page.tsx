"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { RemoteSelect } from "@/components/remote-select"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { createProduct, deleteProduct, adjustProductStock, getProducts, updateProduct } from "@/modules/products/products.api"
import type { Product, ProductPayload } from "@/modules/products/products.types"
import { getCategories } from "@/modules/categories/categories.api"

const initialForm: ProductPayload = {
	name: "",
	category: "",
	unitType: "count",
	unit: "piece",
	costPrice: 0,
	sellingPrice: 0,
	quantity: 0,
	lowStockThreshold: 0,
	status: "active",
}

export default function ProductsPage() {
	const queryClient = useQueryClient()
	const { isAdmin } = useAuth()
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<ProductPayload>(initialForm)

	const categoriesQuery = useQuery({ queryKey: ["categories", "lookup"], queryFn: () => getCategories({ page: 1, limit: 100 }) })
	const productsQuery = useQuery({ queryKey: ["products", page, search], queryFn: () => getProducts({ page, limit: 10, search: search || undefined }) })

	const categoryOptions = useMemo(() => (categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name })), [categoriesQuery.data])

	const saveMutation = useMutation({
		mutationFn: (payload: ProductPayload) => editingId ? updateProduct(editingId, payload) : createProduct(payload),
		onSuccess: async () => {
			setEditingId(null)
			setForm(initialForm)
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteProduct(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
	})

	const stockMutation = useMutation({
		mutationFn: ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) => adjustProductStock(id, { quantity, reason }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
	})

	useEffect(() => {
		setEditingId(null)
		setForm(initialForm)
	}, [page])

	const products = productsQuery.data?.data ?? []

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		saveMutation.mutate(form)
	}

	const startEdit = (product: Product) => {
		setEditingId(product._id)
		setForm({
			name: product.name,
			category: typeof product.category === "string" ? product.category : product.category._id,
			unitType: product.unitType,
			unit: product.unit,
			costPrice: product.costPrice,
			sellingPrice: product.sellingPrice,
			quantity: product.quantity,
			lowStockThreshold: product.lowStockThreshold,
			status: product.status,
		})
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">Inventory</p>
					<h2 className="text-2xl font-semibold tracking-tight">Products</h2>
				</div>
				<Input className="max-w-xs" placeholder="Search products or SKU" value={search} onChange={(event) => setSearch(event.target.value)} />
			</div>

			<div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>{editingId ? "Edit product" : "Create product"}</CardTitle>
						<CardDescription>Product pricing, category, and stock are managed here.</CardDescription>
					</CardHeader>
					<CardContent>
						{isAdmin ? (
							<form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Name</label>
									<Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium">Category</label>
									<RemoteSelect options={categoryOptions} value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} isLoading={categoriesQuery.isLoading} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Unit type</label>
									<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.unitType} onChange={(event) => setForm((current) => ({ ...current, unitType: event.target.value as ProductPayload["unitType"] }))}>
										<option value="count">Count</option>
										<option value="weight">Weight</option>
										<option value="volume">Volume</option>
									</select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Unit</label>
									<Input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value as ProductPayload["unit"] }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Cost price</label>
									<Input type="number" step="0.01" value={form.costPrice} onChange={(event) => setForm((current) => ({ ...current, costPrice: Number(event.target.value) }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Selling price</label>
									<Input type="number" step="0.01" value={form.sellingPrice} onChange={(event) => setForm((current) => ({ ...current, sellingPrice: Number(event.target.value) }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Quantity</label>
									<Input type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Low stock threshold</label>
									<Input type="number" value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: Number(event.target.value) }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Status</label>
									<select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductPayload["status"] }))}>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
									</select>
								</div>
								<div className="flex gap-2 md:col-span-2">
									<Button type="submit" disabled={saveMutation.isPending}>{editingId ? "Save changes" : "Create product"}</Button>
									{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm) }}>Cancel</Button> : null}
								</div>
							</form>
						) : (
							<p className="text-sm text-muted-foreground">You can view products here. Admins can create and edit products.</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Product list</CardTitle>
						<CardDescription>Inventory values and stock status.</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={products}
							isLoading={productsQuery.isLoading}
							onPageChange={setPage}
							page={productsQuery.data?.pagination.page ?? page}
							totalPages={productsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Name", render: (item) => item.name },
								{ head: "SKU", render: (item) => item.sku },
								{ head: "Stock", render: (item) => `${formatNumber(item.quantity)} ${item.unit}` },
								{ head: "Value", render: (item) => formatCurrency(item.quantity * item.costPrice) },
								{ head: "Updated", render: (item) => formatDate(item.updatedAt) },
								{ head: "Actions", render: (item) => (
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
										<Button size="sm" variant="outline" onClick={() => {
											const quantity = Number(window.prompt("Stock adjustment amount (use negative values for stock out):", "1"))
											const reason = window.prompt("Reason for adjustment:", "Inventory correction") ?? ""
											if (!Number.isNaN(quantity) && reason) {
												stockMutation.mutate({ id: item._id, quantity, reason })
											}
										}}><SlidersHorizontal className="size-4" /></Button>
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