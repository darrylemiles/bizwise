import { NextResponse } from "next/server"

const API_URL = process.env.API_URL

export async function POST(request: Request) {
	try {
		const body = await request.json()

		const response = await fetch(`${API_URL}/users/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		const data = await response.json()

		if (!response.ok) {
			return NextResponse.json(data, {
				status: response.status,
			})
		}

		const token = data.token

		if (!token) {
			return NextResponse.json(
				{
					message: "Authentication token missing",
				},
				{
					status: 500,
				},
			)
		}

		const nextResponse = NextResponse.json({
			user: data.user,
			message: data.message,
		})

		nextResponse.cookies.set("access_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		})

		return nextResponse
	} catch {
		return NextResponse.json(
			{
				message: "Unable to connect to server",
			},
			{
				status: 500,
			},
		)
	}
}