"use client"

import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Input } from "@/components/ui/input"
import { RemoteSelect } from "@/components/remote-select"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { createSale, getSales } from "@/modules/sales/sales.api"
import type { SalePayload } from "@/modules/sales/sales.types"
import { getAccounts } from "@/modules/accounts/accounts.api"
import { getProducts } from "@/modules/products/products.api"

const initialRow = { product: "", quantity: 1 }

export default function SalesPage() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [items, setItems] = useState<Array<{ product: string; quantity: number }>>([initialRow])
	const [account, setAccount] = useState("")
	const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10))

	const accountsQuery = useQuery({ queryKey: ["accounts", "lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const productsQuery = useQuery({ queryKey: ["products", "lookup"], queryFn: () => getProducts({ page: 1, limit: 100 }) })
	const salesQuery = useQuery({ queryKey: ["sales", page], queryFn: () => getSales({ page, limit: 10 }) })

	const accountOptions = useMemo(() => (accountsQuery.data?.data ?? []).map((item) => ({ value: item._id, label: `${item.name} (${item.type})` })), [accountsQuery.data])
	const productOptions = useMemo(() => (productsQuery.data?.data ?? []).map((item) => ({ value: item._id, label: `${item.name} (${item.sku})` })), [productsQuery.data])

	const createMutation = useMutation({
		mutationFn: (payload: SalePayload) => createSale(payload),
		onSuccess: async () => {
			setItems([initialRow])
			setAccount("")
			setSaleDate(new Date().toISOString().slice(0, 10))
			await queryClient.invalidateQueries({ queryKey: ["sales"] })
			await queryClient.invalidateQueries({ queryKey: ["products"] })
			await queryClient.invalidateQueries({ queryKey: ["accounts"] })
		},
	})

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const payload: SalePayload = {
			account,
			saleDate: saleDate || undefined,
			items: items.filter((item) => item.product && item.quantity > 0),
		}
		createMutation.mutate(payload)
	}

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
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-sm font-medium">Account</label>
								<RemoteSelect options={accountOptions} value={account} onChange={(event) => setAccount(event.target.value)} isLoading={accountsQuery.isLoading} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Sale date</label>
								<Input type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
							</div>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Items</label>
									<Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => [...current, { ...initialRow }])}><Plus className="mr-1 size-4" />Add item</Button>
								</div>
								{items.map((item, index) => (
									<div key={index} className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2">
										<RemoteSelect options={productOptions} value={item.product} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, product: event.target.value } : row))} isLoading={productsQuery.isLoading} />
										<Input type="number" min="1" value={item.quantity} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row))} />
										<Button type="button" variant="destructive" size="icon" onClick={() => setItems((current) => current.length === 1 ? current : current.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="size-4" /></Button>
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
							onPageChange={setPage}
							page={salesQuery.data?.pagination.page ?? page}
							totalPages={salesQuery.data?.pagination.totalPages ?? 1}
							columns={[
								{ head: "Account", render: (item) => typeof item.account === "string" ? item.account : item.account.name },
								{ head: "Revenue", render: (item) => formatCurrency(item.totalAmount) },
								{ head: "Profit", render: (item) => formatCurrency(item.totalProfit) },
								{ head: "Items", render: (item) => formatNumber(item.items.length) },
								{ head: "Date", render: (item) => formatDate(item.saleDate) },
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}