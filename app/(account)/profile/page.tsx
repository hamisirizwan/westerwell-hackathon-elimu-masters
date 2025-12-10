import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { auth } from "@/lib/auth/auth"

export default async function ProfilePage() {
  const session = await auth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p className="text-lg">{session?.user?.username || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{session?.user?.email || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

