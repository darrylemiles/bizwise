"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormNumericInput, FormSelect } from "@/components/shared/form-controls"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { getErrorMessage } from "@/lib/http-error"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { createProduct, deleteProduct, adjustProductStock, getProducts, updateProduct } from "@/modules/products/products.api"
import type { Product, ProductPayload } from "@/modules/products/products.types"
import { getCategories } from "@/modules/categories/categories.api"
import { productFormSchema, type ProductFormValues } from "@/modules/products/schemas/product-form.schema"
import { stockAdjustmentSchema, type StockAdjustmentValues } from "@/modules/products/schemas/stock-adjustment.schema"
import { StatusBadge } from "@/components/shared/status-badge"
import titleCase from "@/lib/titleCase"

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
	const [pageSize, setPageSize] = useState(10)
	const [search, setSearch] = useState("")
	const [editingId, setEditingId] = useState<string | null>(null)
	const [stockTarget, setStockTarget] = useState<Product | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
	const form = useForm<z.input<typeof productFormSchema>, unknown, ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: initialForm })
	const stockForm = useForm<z.input<typeof stockAdjustmentSchema>, unknown, StockAdjustmentValues>({ resolver: zodResolver(stockAdjustmentSchema), defaultValues: { quantity: 1, reason: "Inventory correction" } })

	const categoriesQuery = useQuery({ queryKey: ["categories", "lookup"], queryFn: () => getCategories({ page: 1, limit: 100 }) })
	const productsQuery = useQuery({ queryKey: ["products", page, pageSize, search], queryFn: () => getProducts({ page, limit: pageSize, search: search || undefined }) })

	const categoryOptions = useMemo(() => (categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name })), [categoriesQuery.data])

	const saveMutation = useMutation({
		mutationFn: (payload: ProductPayload) => editingId ? updateProduct(editingId, payload) : createProduct(payload),
		onSuccess: async () => {
			setEditingId(null)
			form.reset(initialForm)
			toast.success(editingId ? "Product updated" : "Product created")
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to save product")),
	})

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteProduct(id),
		onSuccess: async () => {
			setDeleteTarget(null)
			toast.success("Product deleted")
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to delete product")),
	})

	const stockMutation = useMutation({
		mutationFn: ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) => adjustProductStock(id, { quantity, reason }),
		onSuccess: async () => {
			setStockTarget(null)
			stockForm.reset({ quantity: 1, reason: "Inventory correction" })
			toast.success("Stock adjusted")
			await queryClient.invalidateQueries({ queryKey: ["products"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to adjust stock")),
	})

	const products = productsQuery.data?.data ?? []

	const startEdit = (product: Product) => {
		setEditingId(product._id)
		form.reset({
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
							<form
								className="grid gap-4 md:grid-cols-2"
								onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
							>
								<FormField className="md:col-span-2">
									<FormLabel htmlFor="product-name">Name</FormLabel>
									<Input
										id="product-name"
										aria-invalid={!!form.formState.errors.name}
										{...form.register("name")}
									/>
									<FormMessage>
										{form.formState.errors.name?.message}
									</FormMessage>
								</FormField>

								<div className="md:col-span-2">
									<FormSelect
										control={form.control}
										name="category"
										label="Category"
										options={categoryOptions}
										disabled={categoriesQuery.isLoading}
									/>
								</div>

								<FormSelect
									control={form.control}
									name="unitType"
									label="Unit type"
									options={[
										{ value: "count", label: "Count" },
										{ value: "weight", label: "Weight" },
										{ value: "volume", label: "Volume" },
									]}
								/>

								<FormSelect
									control={form.control}
									name="unit"
									label="Unit"
									options={[
										"piece",
										"box",
										"pack",
										"sack",
										"gram",
										"kilogram",
										"milliliter",
										"liter",
									].map((value) => ({
										value,
										label: titleCase(value),
									}))}
								/>

								<FormNumericInput
									control={form.control}
									name="costPrice"
									id="product-cost"
									label="Cost price"
									step="0.01"
								/>

								<FormNumericInput
									control={form.control}
									name="sellingPrice"
									id="product-selling"
									label="Selling price"
									step="0.01"
								/>

								<FormNumericInput
									control={form.control}
									name="quantity"
									id="product-quantity"
									label="Quantity"
									step="0.01"
								/>

								<FormNumericInput
									control={form.control}
									name="lowStockThreshold"
									id="product-threshold"
									label="Low stock threshold"
									step="0.01"
								/>

								<div className="md:col-span-2">
									<FormSelect
										control={form.control}
										name="status"
										label="Status"
										options={[
											{ value: "active", label: "Active" },
											{ value: "inactive", label: "Inactive" },
										]}
									/>
								</div>

								<div className="flex gap-2 md:col-span-2">
									<Button type="submit" disabled={saveMutation.isPending}>
										{editingId ? "Save changes" : "Create product"}
									</Button>

									{editingId ? (
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setEditingId(null);
												form.reset(initialForm);
											}}
										>
											Cancel
										</Button>
									) : null}
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
							isError={productsQuery.isError}
							error={productsQuery.error}
							onRetry={() => productsQuery.refetch()}
							onPageChange={(nextPage) => { setPage(nextPage); setEditingId(null); form.reset(initialForm) }}
							onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1) }}
							pageSize={productsQuery.data?.pagination.limit ?? pageSize}
							total={productsQuery.data?.pagination.total ?? 0}
							page={productsQuery.data?.pagination.page ?? page}
							totalPages={productsQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Product Name", render: (item) => item.name || "-" },
								{ head: "Status", render: (item) => <StatusBadge value={item.status} /> },
								{ head: "Stock", render: (item) => `${formatNumber(item.quantity)} ${titleCase(item.unit)}` },
								{ head: "Value", render: (item) => formatCurrency(item.quantity * item.costPrice) },
								{ head: "Updated", render: (item) => formatDate(item.updatedAt) },
								{
									head: "Actions", render: (item) => (
										<div className="flex gap-2">
											<Button size="sm" variant="outline" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Pencil className="size-4" /></Button>
											<Button size="sm" variant="outline" aria-label={`Adjust stock for ${item.name}`} onClick={() => setStockTarget(item)}><SlidersHorizontal className="size-4" /></Button>
											<Button size="sm" variant="destructive" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget({ id: item._id, name: item.name })}><Trash2 className="size-4" /></Button>
										</div>
									)
								},
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name || "Unnamed product"}</p><p className="text-sm text-muted-foreground">{item.sku || "No SKU"}</p></div><StatusBadge value={item.status} /></div><p className="text-sm">{formatNumber(item.quantity)} {titleCase(item.unit)} · {formatCurrency(item.sellingPrice)}</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}><Pencil className="size-4" /></Button><Button size="sm" variant="outline" onClick={() => setStockTarget(item)} aria-label={`Adjust stock for ${item.name}`}><SlidersHorizontal className="size-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: item._id, name: item.name })} aria-label={`Delete ${item.name}`}><Trash2 className="size-4" /></Button></div></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
			<Dialog open={!!stockTarget} onOpenChange={(open) => !open && setStockTarget(null)}><DialogContent><DialogHeader><DialogTitle>Adjust stock</DialogTitle><DialogDescription>{stockTarget?.name}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={stockForm.handleSubmit((values) => stockTarget && stockMutation.mutate({ id: stockTarget._id, ...values }))}><FormNumericInput control={stockForm.control} name="quantity" id="stock-quantity" label="Adjustment amount" step="0.01" allowNegative /><FormField><FormLabel htmlFor="stock-reason">Reason</FormLabel><Textarea id="stock-reason" {...stockForm.register("reason")} /><FormMessage>{stockForm.formState.errors.reason?.message}</FormMessage></FormField><DialogFooter><Button type="submit" disabled={stockMutation.isPending}>Adjust stock</Button></DialogFooter></form></DialogContent></Dialog>
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete product?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline">Cancel</Button>} /><AlertDialogAction render={<Button variant="destructive" disabled={removeMutation.isPending} onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete product</Button>} /></AlertDialogFooter></AlertDialogContent></AlertDialog>
		</div>
	)
}