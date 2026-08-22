"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2, Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { FormField, FormLabel } from "@/components/ui/form"
import { FormDatePicker, FormNumericInput, FormSelect } from "@/components/shared/form-controls"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { toApiDate } from "@/lib/date"
import { getErrorMessage } from "@/lib/http-error"
import { createSale, getSales } from "@/modules/sales/sales.api"
import type { SalePayload } from "@/modules/sales/sales.types"
import { getAccounts } from "@/modules/accounts/accounts.api"
import { getProducts } from "@/modules/products/products.api"
import { saleFormSchema, type SaleFormValues } from "@/modules/sales/schemas/sale-form.schema"

const initialRow = { product: "", quantity: 1 }

export default function SalesPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const form = useForm<z.input<typeof saleFormSchema>, unknown, SaleFormValues>({ resolver: zodResolver(saleFormSchema), defaultValues: { account: "", saleDate: new Date().toISOString().slice(0, 10), items: [initialRow] } })
	const itemsField = useFieldArray({ control: form.control, name: "items" })

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const productsQuery = useQuery({ queryKey: ["products", "lookup"], queryFn: () => getProducts({ page: 1, limit: 100 }) })
	const salesQuery = useQuery({ queryKey: ["sales", page, pageSize], queryFn: () => getSales({ page, limit: pageSize }) })

	const accountOptions = useMemo(() => (accountsQuery.data?.data ?? []).map((item) => ({ value: item._id, label: `${item.name} (${item.type})` })), [accountsQuery.data])
	const productOptions = useMemo(() => (productsQuery.data?.data ?? []).map((item) => ({ value: item._id, label: `${item.name} (${item.sku})` })), [productsQuery.data])

	const createMutation = useMutation({
		mutationFn: (payload: SalePayload) => createSale(payload),
		onSuccess: async () => {
			form.reset({ account: "", saleDate: new Date().toISOString().slice(0, 10), items: [initialRow] })
			toast.success("Sale created")
			await queryClient.invalidateQueries({ queryKey: ["sales"] })
			await queryClient.invalidateQueries({ queryKey: ["products"] })
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to create sale")),
	})

	const handleSubmit = (values: SaleFormValues) => createMutation.mutate({ ...values, saleDate: toApiDate(values.saleDate) })

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Revenue</p>
				<h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
			</div>

			<div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle>Create sale</CardTitle>
						<CardDescription>Post a sale, update stock, and record an income transaction.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
							<FormSelect control={form.control} name="account" label="Account" options={accountOptions} disabled={accountsQuery.isLoading} />
							<FormDatePicker control={form.control} name="saleDate" label="Sale date" />
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Items</label>
										<Button type="button" variant="outline" size="sm" onClick={() => itemsField.append({ ...initialRow })}><Plus className="mr-1 size-4" />Add item</Button>
								</div>
								{itemsField.fields.map((item, index) => (
									<div key={item.id} className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2">
										<FormField><FormLabel className="sr-only">Product</FormLabel><FormSelect control={form.control} name={`items.${index}.product`} label="" options={productOptions} disabled={productsQuery.isLoading} /></FormField>
										<FormNumericInput control={form.control} name={`items.${index}.quantity`} id={`sale-quantity-${index}`} label="Quantity" step="1" min="1" />
										<Button type="button" variant="destructive" size="icon" aria-label="Remove sale item" onClick={() => itemsField.remove(index)}><Trash2 className="size-4" /></Button>
									</div>
								))}
							</div>
							<Button type="submit" className="w-full" disabled={createMutation.isPending}>Create sale</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Sales history</CardTitle>
						<CardDescription>Recent sales with account and profit totals.</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={salesQuery.data?.data ?? []}
							isLoading={salesQuery.isLoading}
							isError={salesQuery.isError}
							error={salesQuery.error}
							onRetry={() => salesQuery.refetch()}
							onPageChange={setPage}
							onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1) }}
							pageSize={salesQuery.data?.pagination.limit ?? pageSize}
							total={salesQuery.data?.pagination.total ?? 0}
							page={salesQuery.data?.pagination.page ?? page}
							totalPages={salesQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Account", render: (item) => typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account" },
								{ head: "Revenue", render: (item) => formatCurrency(item.totalAmount) },
								{ head: "Profit", render: (item) => formatCurrency(item.totalProfit) },
								{ head: "Items", render: (item) => formatNumber(item.items.length) },
								{ head: "Date", render: (item) => formatDate(item.saleDate) },
							]}
							cardRenderer={(item) => <Card><CardContent className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><p className="font-medium">{typeof item.account === "string" ? item.account : item.account?.name ?? "Unknown account"}</p><p className="text-sm text-muted-foreground">{formatDate(item.saleDate)}</p></div><div className="grid grid-cols-3 gap-2 text-sm"><span>Revenue<br /><strong>{formatCurrency(item.totalAmount)}</strong></span><span>Profit<br /><strong>{formatCurrency(item.totalProfit)}</strong></span><span>Items<br /><strong>{formatNumber(item.items?.length)}</strong></span></div></CardContent></Card>}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}