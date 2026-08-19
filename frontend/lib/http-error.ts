import axios from "axios"

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}
