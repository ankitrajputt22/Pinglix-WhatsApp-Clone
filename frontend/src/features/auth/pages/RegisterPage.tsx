import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Join Pinglix"
      title="Create your account"
      description="Set up your secure Pinglix account to begin the journey."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
