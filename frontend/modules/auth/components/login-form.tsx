"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
	loginSchema,
	type LoginFormValues,
} from "../schemas/auth.schema"

import { useLogin } from "../hooks/use-login"

export function LoginForm() {
	const router = useRouter()

	const loginMutation = useLogin()

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	})

	const onSubmit = (values: LoginFormValues) => {
		loginMutation.mutate(values, {
			onSuccess: () => {
				router.replace("/portal/dashboard")
				router.refresh()
			},
		})
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">
					Welcome back
				</CardTitle>

				<CardDescription>
					Sign in to your Bizwise account
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-5"
				>
					<div className="space-y-2">
						<Label htmlFor="username">
							Username
						</Label>

						<Input
							id="username"
							type="text"
							placeholder="Enter your username"
							autoComplete="username"
							{...form.register("username")}
						/>

						{form.formState.errors.username && (
							<p className="text-sm text-destructive">
								{
									form.formState.errors
										.username.message
								}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							Password
						</Label>

						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							autoComplete="current-password"
							{...form.register("password")}
						/>

						{form.formState.errors.password && (
							<p className="text-sm text-destructive">
								{
									form.formState.errors
										.password.message
								}
							</p>
						)}
					</div>

					{loginMutation.isError && (
						<p className="text-sm text-destructive">
							Unable to sign in. Please check your
							username and password.
						</p>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={loginMutation.isPending}
					>
						{loginMutation.isPending
							? "Signing in..."
							: "Sign in"}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}