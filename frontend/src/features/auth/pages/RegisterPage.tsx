import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Create your space"
      title="Create your account"
      description="Real-time conversations, instantly connected."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
