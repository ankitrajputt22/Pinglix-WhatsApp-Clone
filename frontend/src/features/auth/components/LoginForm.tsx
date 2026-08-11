import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Icon } from "../../../components/ui/Icon";
import { authErrorMessage } from "../lib/auth-error";
import { useLogin } from "../hooks/useLogin";
import {
  loginSchema,
  type LoginFormValues
} from "../schemas/login-schema";
import { FormField } from "./FormField";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const submit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigate("/app", { replace: true });
    } catch {
      // The mutation error is rendered in the form-level live region.
    }
  });

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <FormField
        id="login-email"
        label="Email"
        icon="mail"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        registration={register("email")}
      />
      <FormField
        id="login-password"
        label="Password"
        icon="lock"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        registration={register("password")}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-pinglix-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pinglix-600"
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              className="h-5 w-5"
            />
          </button>
        }
      />

      {login.isError ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {authErrorMessage(login.error, "Unable to log in. Please try again.")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isValid || login.isPending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-pinglix-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
      >
        {login.isPending ? (
          "Logging in..."
        ) : (
          <>
            Login
            <Icon name="arrow-right" className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted">
        New to Pinglix?{" "}
        <Link
          to="/register"
          className="font-semibold text-pinglix-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
        >
          Create an account.
        </Link>
      </p>
    </form>
  );
}
