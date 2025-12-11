'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronDown, ChevronUp, Edit, Trash2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { createModule } from '@/actions/modules/createModule'
import { deleteModule } from '@/actions/modules/deleteModule'
import { createLesson } from '@/actions/lessons/createLesson'
import { deleteLesson } from '@/actions/lessons/deleteLesson'
import { ModuleDialog } from './ModuleDialog'
import { LessonDialog } from './LessonDialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Module {
  id: string
  title: string
  description?: string
  order: number
  lessons: Array<{
    id: string
    title: string
    description?: string
    videoUrl: string
    duration?: number
    order: number
    isFreePreview: boolean
  }>
}

interface ModulesManagerProps {
  courseId: string
  initialModules: Module[]
}

export function ModulesManager({ courseId, initialModules }: ModulesManagerProps) {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Sync modules when initialModules changes (after refresh)
  useEffect(() => {
    setModules(initialModules)
  }, [initialModules])
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ lesson: { id: string; title: string; description?: string; videoUrl: string; duration?: number; order: number; isFreePreview: boolean }; moduleId: string } | null>(null)
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null)
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleCreateModule = async (data: { title: string; description?: string }) => {
    const result = await createModule({
      courseId,
      title: data.title,
      description: data.description,
    })

    if (result.success && result.data) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteModule = async () => {
    if (!deleteModuleId) return
    setIsDeleting(true)
    const result = await deleteModule(deleteModuleId)
    setIsDeleting(false)

    if (result.success) {
      toast.success(result.message)
      setDeleteModuleId(null)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleCreateLesson = async (moduleId: string, data: { title: string; description?: string; videoUrl: string; duration?: number; isFreePreview: boolean }) => {
    const result = await createLesson({
      moduleId,
      ...data,
    })

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return
    setIsDeleting(true)
    const result = await deleteLesson(deleteLessonId)
    setIsDeleting(false)

    if (result.success) {
      toast.success(result.message)
      setDeleteLessonId(null)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Modules & Lessons</h2>
          <p className="text-sm text-muted-foreground">Organize your course content into modules and lessons</p>
        </div>
        <Button onClick={() => { setEditingModule(null); setModuleDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No modules yet. Create your first module to get started.</p>
            <Button onClick={() => { setEditingModule(null); setModuleDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleModule(module.id)}
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingModule(module); setModuleDialogOpen(true) }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteModuleId(module.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedModules.has(module.id) && (
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Lessons ({module.lessons.length})</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedModuleId(module.id); setEditingLesson(null); setLessonDialogOpen(true) }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                    {module.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No lessons yet. Add your first lesson.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Play className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{lesson.title}</span>
                                  {lesson.isFreePreview && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                )}
                                {lesson.duration && (
                                  <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingLesson({ lesson, moduleId: module.id }); setLessonDialogOpen(true) }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteLessonId(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <ModuleDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        onSubmit={handleCreateModule}
        module={editingModule}
        courseId={courseId}
      />

      {/* Lesson Dialog */}
      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        onSubmit={(data) => {
          if (selectedModuleId || editingLesson) {
            handleCreateLesson(selectedModuleId || editingLesson!.moduleId, data)
          }
        }}
        lesson={editingLesson?.lesson}
        moduleId={selectedModuleId || editingLesson?.moduleId || ''}
      />

      {/* Delete Module Dialog */}
      <AlertDialog open={!!deleteModuleId} onOpenChange={(open) => !open && setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this module? This will also delete all lessons within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={(open) => !open && setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

