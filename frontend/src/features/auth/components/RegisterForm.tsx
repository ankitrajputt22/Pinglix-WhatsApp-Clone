import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Icon } from "../../../components/ui/Icon";
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
  const [showPasswords, setShowPasswords] = useState(false);
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

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPasswords((visible) => !visible)}
      aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
      className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-pinglix-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pinglix-600"
    >
      <Icon
        name={showPasswords ? "eye-off" : "eye"}
        className="h-5 w-5"
      />
    </button>
  );

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <FormField
        id="register-display-name"
        label="Display name"
        icon="profile"
        type="text"
        autoComplete="name"
        placeholder="How should we call you?"
        error={errors.displayName?.message}
        registration={register("displayName")}
      />
      <FormField
        id="register-email"
        label="Email"
        icon="mail"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        registration={register("email")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="register-password"
          label="Password"
          icon="lock"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password?.message}
          registration={register("password")}
        />
        <FormField
          id="register-confirm-password"
          label="Confirm password"
          icon="shield"
          trailing={passwordToggle}
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Confirm password"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />
      </div>
      <p className="-mt-2 text-xs leading-5 text-muted">
        Use at least 8 characters. Your password is sent only to the secure
        Pinglix backend.
      </p>

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
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-pinglix-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
      >
        {createAccount.isPending ? (
          "Creating account..."
        ) : (
          <>
            Register
            <Icon name="arrow-right" className="h-4 w-4" />
          </>
        )}
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
