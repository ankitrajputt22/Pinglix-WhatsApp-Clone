import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useRegister } from "../hooks/useRegister";
import { authErrorMessage } from "../lib/auth-error";
import {
  registerSchema,
  type RegisterFormValues
} from "../schemas/register-schema";
import { FormField } from "./FormField";

export function RegisterForm() {
  const navigate = useNavigate();
  const createAccount = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const submit = handleSubmit(async ({ confirmPassword: _, ...values }) => {
    try {
      await createAccount.mutateAsync(values);
      navigate("/app", { replace: true });
    } catch {
      // The mutation error is rendered in the form-level live region.
    }
  });

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <FormField
        id="register-display-name"
        label="Display name"
        type="text"
        autoComplete="name"
        placeholder="Enter your display name"
        error={errors.displayName?.message}
        registration={register("displayName")}
      />
      <FormField
        id="register-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        registration={register("email")}
      />
      <FormField
        id="register-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Create a password"
        error={errors.password?.message}
        registration={register("password")}
      />
      <FormField
        id="register-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        registration={register("confirmPassword")}
      />

      {createAccount.isError ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {authErrorMessage(
            createAccount.error,
            "Unable to create your account. Please try again."
          )}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isValid || createAccount.isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-pinglix-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
      >
        {createAccount.isPending ? "Creating account..." : "Register"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-pinglix-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
        >
          Log in.
        </Link>
      </p>
    </form>
  );
}
