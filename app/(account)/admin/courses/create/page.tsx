import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateCourseForm } from "./components/CreateCourseForm"

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Course</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new course for your students
          </p>
        </div>
      </div>

      <CreateCourseForm />
    </div>
  )
}

