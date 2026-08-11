import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Secure sign in"
      title="Log in to Pinglix"
      description="Welcome back. Continue to your private conversations."
    >
      <LoginForm />
    </AuthLayout>
  );
}
