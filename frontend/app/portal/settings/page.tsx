"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/modules/auth/hooks/use-auth"
import { updateUser } from "@/modules/users/users.api"

export default function SettingsPage() {
	const queryClient = useQueryClient()
	const { user } = useAuth()
	const [name, setName] = useState("")
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")

	useEffect(() => {
		setName(user?.name ?? "")
		setUsername(user?.username ?? "")
	}, [user])

	const saveMutation = useMutation({
		mutationFn: () => {
			if (!user?.id) {
				throw new Error("Missing user id")
			}

			return updateUser(user.id, {
				name,
				username,
				password: password || undefined,
			})
		},
		onSuccess: async () => {
			setPassword("")
			await queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
		},
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
					<form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate() }}>
						<div className="space-y-2">
							<label className="text-sm font-medium">Name</label>
							<Input value={name} onChange={(event) => setName(event.target.value)} />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Username</label>
							<Input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">New password</label>
							<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
						</div>
						<div className="flex items-center gap-3">
							<Button type="submit" disabled={saveMutation.isPending}>Save profile</Button>
							<p className="text-sm text-muted-foreground">Role: {user?.role ?? "user"}</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}