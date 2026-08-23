"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Plus, ReceiptText, ShoppingCart, X, Zap } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { FormDatePicker, FormNumericInput, FormSelect } from "@/components/shared/form-controls"
import { getErrorMessage } from "@/lib/http-error"
import { toApiDate } from "@/lib/date"
import { createAccount, getAccounts } from "@/modules/accounts/accounts.api"
import { createSale } from "@/modules/sales/sales.api"
import type { SalePayload } from "@/modules/sales/sales.types"
import { getProducts } from "@/modules/products/products.api"
import { createTransaction } from "@/modules/transactions/transactions.api"
import type { TransactionPayload } from "@/modules/transactions/transactions.types"
import { getCategories } from "@/modules/categories/categories.api"
import { accountFormSchema, type AccountFormValues } from "@/modules/accounts/schemas/account-form.schema"
import { saleFormSchema, type SaleFormValues } from "@/modules/sales/schemas/sale-form.schema"
import { transactionFormSchema, type TransactionFormValues } from "@/modules/transactions/schemas/transaction-form.schema"

const storageKey = "bizwise-quick-actions-open"
const initialAccount = { name: "", type: "cash" as const, description: "" }
const initialTransaction: TransactionPayload = { type: "income", amount: 0, account: "", destinationAccount: "", category: "", description: "", reference: "", date: new Date().toISOString().slice(0, 10) }

type Action = "account" | "sale" | "transaction"

export function QuickActions() {
	const [isOpened, setIsOpened] = useState(true)
	const [hydrated, setHydrated] = useState(false)
	const [activeAction, setActiveAction] = useState<Action | null>(null)

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(storageKey)
			if (saved === "true" || saved === "false") {
				// Hydrate the persisted preference once the browser is available.
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setIsOpened(saved === "true")
			}
		} catch {
			// Storage may be unavailable in private browsing or restricted environments.
		} finally {
			setHydrated(true)
		}
	}, [])

	useEffect(() => {
		if (!hydrated) return
		try { window.localStorage.setItem(storageKey, String(isOpened)) } catch { /* Keep the preference in memory. */ }
	}, [hydrated, isOpened])

	return (
		<>
			<div className={`fixed bottom-16 right-4 z-40 max-w-[calc(100vw-2rem)] transition-transform duration-300 ease-out ${isOpened ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"}`}>
				<div className="flex max-w-full flex-wrap items-center justify-end gap-2 rounded-2xl border bg-card/95 p-2 shadow-lg backdrop-blur">
					<span className="hidden px-2 text-xs font-semibold text-muted-foreground sm:inline">Quick Actions</span>
					<ActionButton label="Create Account" icon={Plus} onClick={() => setActiveAction("account")} />
					<ActionButton label="Generate Sale" icon={ShoppingCart} onClick={() => setActiveAction("sale")} />
					<ActionButton label="Log Transaction" icon={ReceiptText} onClick={() => setActiveAction("transaction")} />
					<Button type="button" variant="ghost" size="icon-sm" aria-label="Close quick actions" onClick={() => setIsOpened(false)}><X /></Button>
				</div>
			</div>
			{!isOpened ? <Button type="button" variant="default" size="icon" className="fixed bottom-16 right-4 z-40 shadow-lg" aria-label="Open quick actions" onClick={() => setIsOpened(true)}><Zap /></Button> : null}
			<ActionDialog action={activeAction} onClose={() => setActiveAction(null)} />
		</>
	)
}

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: typeof Plus; onClick: () => void }) {
	return <Button type="button" variant="outline" size="sm" onClick={onClick}><Icon /> <span>{label}</span></Button>
}

function ActionDialog({ action, onClose }: { action: Action | null; onClose: () => void }) {
	return <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">{action === "account" ? <AccountActionForm onComplete={onClose} /> : null}{action === "sale" ? <SaleActionForm onComplete={onClose} /> : null}{action === "transaction" ? <TransactionActionForm onComplete={onClose} /> : null}</DialogContent></Dialog>
}

function AccountActionForm({ onComplete }: { onComplete: () => void }) {
	const queryClient = useQueryClient()
	const form = useForm<AccountFormValues>({ resolver: zodResolver(accountFormSchema), defaultValues: initialAccount })
	const mutation = useMutation({ mutationFn: createAccount, onSuccess: async () => { toast.success("Account created"); await queryClient.invalidateQueries({ queryKey: ["accounts"] }); onComplete() }, onError: (error) => toast.error(getErrorMessage(error, "Unable to create account")) })
	return <><DialogHeader><DialogTitle>Create Account</DialogTitle><DialogDescription>Add an account without leaving the current page.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><FormField><FormLabel htmlFor="quick-account-name">Name</FormLabel><Input id="quick-account-name" {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField><FormSelect control={form.control} name="type" label="Type" options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }, { value: "e-wallet", label: "E-wallet" }]} /><FormField><FormLabel htmlFor="quick-account-description">Description</FormLabel><Textarea id="quick-account-description" {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField><DialogFooter><Button type="submit" disabled={mutation.isPending}>Create account</Button></DialogFooter></form></>
}

function SaleActionForm({ onComplete }: { onComplete: () => void }) {
	const queryClient = useQueryClient()
	const form = useForm<z.input<typeof saleFormSchema>, unknown, SaleFormValues>({ resolver: zodResolver(saleFormSchema), defaultValues: { account: "", saleDate: new Date().toISOString().slice(0, 10), items: [{ product: "", quantity: 1 }] } })
	const items = useFieldArray({ control: form.control, name: "items" })
	const accounts = useQuery({ queryKey: ["accounts", "quick-lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const products = useQuery({ queryKey: ["products", "quick-lookup"], queryFn: () => getProducts({ page: 1, limit: 100 }) })
	const mutation = useMutation({ mutationFn: (values: SaleFormValues) => createSale({ ...values, saleDate: toApiDate(values.saleDate) } as SalePayload), onSuccess: async () => { toast.success("Sale created"); await Promise.all([queryClient.invalidateQueries({ queryKey: ["sales"] }), queryClient.invalidateQueries({ queryKey: ["products"] }), queryClient.invalidateQueries({ queryKey: ["accounts"] })]); onComplete() }, onError: (error) => toast.error(getErrorMessage(error, "Unable to create sale")) })
	return <><DialogHeader><DialogTitle>Generate Sale</DialogTitle><DialogDescription>Record a sale and update inventory immediately.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><FormSelect control={form.control} name="account" label="Account" options={(accounts.data?.data ?? []).map((item) => ({ value: item._id, label: item.name }))} disabled={accounts.isLoading} /><FormDatePicker control={form.control} name="saleDate" label="Sale date" /><div className="space-y-2"><div className="flex items-center justify-between"><FormLabel>Items</FormLabel><Button type="button" variant="outline" size="sm" onClick={() => items.append({ product: "", quantity: 1 })}>Add item</Button></div>{items.fields.map((item, index) => <div key={item.id} className="grid grid-cols-[1fr_6rem_auto] items-end gap-2"><FormSelect control={form.control} name={`items.${index}.product`} label="Product" options={(products.data?.data ?? []).map((product) => ({ value: product._id, label: product.name }))} disabled={products.isLoading} /><FormNumericInput control={form.control} name={`items.${index}.quantity`} id={`quick-sale-quantity-${index}`} label="Quantity" step="1" min="1" /><Button type="button" variant="ghost" size="icon-sm" aria-label="Remove sale item" onClick={() => items.remove(index)}><X /></Button></div>)}</div><DialogFooter><Button type="submit" disabled={mutation.isPending}>Generate sale</Button></DialogFooter></form></>
}

function TransactionActionForm({ onComplete }: { onComplete: () => void }) {
	const queryClient = useQueryClient()
	const form = useForm<z.input<typeof transactionFormSchema>, unknown, TransactionFormValues>({ resolver: zodResolver(transactionFormSchema), defaultValues: initialTransaction })
	const type = useWatch({ control: form.control, name: "type" })
	const accounts = useQuery({ queryKey: ["accounts", "quick-lookup"], queryFn: () => getAccounts({ page: 1, limit: 100 }) })
	const categories = useQuery({ queryKey: ["categories", "quick-lookup"], queryFn: () => getCategories({ page: 1, limit: 100 }) })
	const mutation = useMutation({ mutationFn: (values: TransactionFormValues) => createTransaction({ ...values, amount: Number(values.amount), destinationAccount: type === "transfer" ? values.destinationAccount : undefined, category: type === "income" || type === "expense" ? values.category : undefined }), onSuccess: async () => { toast.success("Transaction created"); await Promise.all([queryClient.invalidateQueries({ queryKey: ["transactions"] }), queryClient.invalidateQueries({ queryKey: ["accounts"] })]); onComplete() }, onError: (error) => toast.error(getErrorMessage(error, "Unable to create transaction")) })
	const accountOptions = (accounts.data?.data ?? []).map((item) => ({ value: item._id, label: item.name }))
	return <><DialogHeader><DialogTitle>Log Transaction</DialogTitle><DialogDescription>Post ledger activity from any portal page.</DialogDescription></DialogHeader><form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><FormSelect control={form.control} name="type" label="Type" options={["income", "expense", "loan", "capital", "transfer"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /><FormNumericInput control={form.control} name="amount" id="quick-transaction-amount" label="Amount" step="0.01" /><FormDatePicker control={form.control} name="date" label="Date" /><FormSelect control={form.control} name="account" label="Account" options={accountOptions} disabled={accounts.isLoading} />{type === "transfer" ? <FormSelect control={form.control} name="destinationAccount" label="Destination account" options={accountOptions} disabled={accounts.isLoading} /> : null}{type === "income" || type === "expense" ? <FormSelect control={form.control} name="category" label="Category" options={(categories.data?.data ?? []).map((item) => ({ value: item._id, label: item.name }))} disabled={categories.isLoading} /> : null}<FormField className="sm:col-span-2"><FormLabel htmlFor="quick-transaction-description">Description</FormLabel><Textarea id="quick-transaction-description" {...form.register("description")} /><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormField><FormField className="sm:col-span-2"><FormLabel htmlFor="quick-transaction-reference">Reference</FormLabel><Input id="quick-transaction-reference" {...form.register("reference")} /><FormMessage>{form.formState.errors.reference?.message}</FormMessage></FormField><DialogFooter className="sm:col-span-2"><Button type="submit" disabled={mutation.isPending}>Log transaction</Button></DialogFooter></form></>
}
