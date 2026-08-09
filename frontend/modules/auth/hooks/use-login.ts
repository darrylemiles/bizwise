"use client"

import { useMutation } from "@tanstack/react-query"
import type { LoginFormValues } from "../schemas/auth.schema"
import { login } from "../auth.api"

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginFormValues) => login(data),
  })
}