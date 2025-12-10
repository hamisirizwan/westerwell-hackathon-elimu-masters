import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "./components/RegisterForm";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    return redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[440px]">
        <CardContent className="pt-6 pb-4 px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to register
            </p>
          </div>
          {config.isRegistrationAllowed ? (
            <RegisterForm />
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Registration is currently closed. New accounts cannot be created at this time.
              </p>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-foreground">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

