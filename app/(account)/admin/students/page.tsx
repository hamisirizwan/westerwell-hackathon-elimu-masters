import { getAllEnrollments } from "@/actions/enrollments/getAllEnrollments"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { StudentsTable } from "./components/StudentsTable"

export const metadata = {
  title: 'Students',
  description: 'View student enrollments and payment status',
}

export default async function AdminStudentsPage() {
  const result = await getAllEnrollments()
  const enrollments = result.success ? result.data || [] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">
          Enrollment details with payments and balances
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No enrollments yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Student enrollments will appear here once courses have active students.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''} total
          </div>
          <StudentsTable enrollments={enrollments} />
        </div>
      )}
    </div>
  )
}

