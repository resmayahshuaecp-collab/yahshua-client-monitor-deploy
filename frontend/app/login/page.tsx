import { Card, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardTitle className="mb-4 normal-case text-base text-ink">
          YAHSHUA Client Monitor
        </CardTitle>
        <LoginForm />
      </Card>
    </main>
  );
}
