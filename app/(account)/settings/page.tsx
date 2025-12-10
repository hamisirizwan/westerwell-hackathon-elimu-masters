import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { auth } from "@/lib/auth/auth"
import { ChangePasswordForm } from "./components/ChangePasswordForm"
import { User, Mail, Calendar } from "lucide-react"
import dbConnect from "@/db/dbConnect"
import { User as UserModel } from "@/db/models/UserModel"

async function getUserInfo(userId: string) {
  await dbConnect()
  const user = await UserModel.findById(userId).select('username email createdAt')
  return user
}

export default async function SettingsPage() {
  const session = await auth()
  const user = session?.user?.id ? await getUserInfo(session.user.id) : null

  const createdAt = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-base">{session?.user?.username || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{session?.user?.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-base">{createdAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
