import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Pinglix"
      description="Use your account to continue to the protected Pinglix application."
    >
      <LoginForm />
    </AuthLayout>
  );
}
