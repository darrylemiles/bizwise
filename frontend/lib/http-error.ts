import axios from "axios"

type ApiErrorResponse = {
  message?: unknown
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
