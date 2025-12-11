'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface SelfPacedLearningProps {
  course: {
    id: string
    title: string
    slug: string
    thumbnail?: string
    category?: string
    level?: string
  }
  modules: Module[]
}

export function SelfPacedLearning({ course, modules }: SelfPacedLearningProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedLesson, setSelectedLesson] = useState<string | null>(
    modules.length > 0 && modules[0].lessons.length > 0 ? modules[0].lessons[0].id : null
  )

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const selectedLessonData = (() => {
    for (const module of modules) {
      const lesson = module.lessons.find((l) => l.id === selectedLesson)
      if (lesson) return { lesson, moduleTitle: module.title }
    }
    return null
  })()

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const videoId = selectedLessonData ? getYouTubeVideoId(selectedLessonData.lesson.videoUrl) : null

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-0">
      {/* Main Content - Video Player */}
      <div className="lg:col-span-2 space-y-4 lg:pr-6 lg:border-r">
        {selectedLessonData && videoId ? (
          <>
            <div>
              <div className="space-y-2 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{selectedLessonData.lesson.title}</h2>
                    {selectedLessonData.moduleTitle && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedLessonData.moduleTitle}
                      </p>
                    )}
                  </div>
                </div>
                {selectedLessonData.lesson.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLessonData.lesson.description}
                  </p>
                )}
              </div>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={selectedLessonData.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Select a lesson to start learning</p>
          </div>
        )}
      </div>

      {/* Sidebar - Modules and Lessons */}
      <div className="lg:col-span-1 space-y-4 lg:pl-6">
        <div>
          <h3 className="font-semibold mb-4">Course Content</h3>
          <div className="space-y-2">
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules available yet.</p>
            ) : (
              modules.map((module) => (
                <div key={module.id}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors rounded-lg"
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{module.title}</div>
                      {module.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {module.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </div>
                    </div>
                    {expandedModules.has(module.id) ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedModules.has(module.id) && (
                    <div className="mt-1">
                      {module.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson.id)}
                          className={cn(
                            'w-full flex items-start gap-3 p-3 text-left hover:bg-muted transition-colors rounded-lg',
                            selectedLesson === lesson.id && 'bg-muted'
                          )}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {selectedLesson === lesson.id ? (
                              <Play className="h-4 w-4 text-primary" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{lesson.title}</div>
                            {lesson.description && (
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {lesson.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {lesson.duration && (
                                <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                              )}
                              {lesson.isFreePreview && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Free
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

