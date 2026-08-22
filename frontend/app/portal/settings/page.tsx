"use client"

import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { updateUser } from "@/modules/users/users.api"
import { settingsFormSchema, type SettingsFormValues } from "@/modules/settings/schemas/settings-form.schema"
import { getErrorMessage } from "@/lib/http-error"
import titleCase from "@/lib/titleCase"

export default function SettingsPage() {
	const queryClient = useQueryClient()
	const { user } = useAuth()
	const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues: { name: "", username: "", password: "" } })

	useEffect(() => {
		form.reset({ name: user?.name ?? "", username: user?.username ?? "", password: "" })
	}, [user, form])

	const saveMutation = useMutation({
		mutationFn: (values: SettingsFormValues) => {
			if (!user?.id) {
				throw new Error("Missing user id")
			}

			return updateUser(user.id, { ...values, password: values.password || undefined })
		},
		onSuccess: async () => {
			form.reset({ ...form.getValues(), password: "" })
			toast.success("Profile updated")
			await queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
		},
		onError: (error) => toast.error(getErrorMessage(error, "Unable to update profile")),
	})

	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<p className="text-sm text-muted-foreground">Account</p>
				<h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>Update your own account details.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
						<FormField><FormLabel htmlFor="settings-name">Name</FormLabel><Input id="settings-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} /><FormMessage>{form.formState.errors.name?.message}</FormMessage></FormField>
						<FormField><FormLabel htmlFor="settings-username">Username</FormLabel><Input id="settings-username" aria-invalid={!!form.formState.errors.username} {...form.register("username", { onChange: (event) => { event.target.value = event.target.value.toLowerCase() } })} /><FormMessage>{form.formState.errors.username?.message}</FormMessage></FormField>
						<FormField><FormLabel htmlFor="settings-password">New password</FormLabel><Input id="settings-password" type="password" aria-invalid={!!form.formState.errors.password} {...form.register("password")} /><FormMessage>{form.formState.errors.password?.message}</FormMessage></FormField>
						<div className="flex items-center gap-3">
							<Button type="submit" disabled={saveMutation.isPending}>Save profile</Button>
							<p className="text-sm text-muted-foreground">Role: {titleCase(user?.role ?? "user")}</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}