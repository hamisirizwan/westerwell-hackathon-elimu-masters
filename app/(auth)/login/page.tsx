import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./components/LoginForm";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    return redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[440px]">
        <CardContent className="pt-6 pb-4 px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in
            </p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

