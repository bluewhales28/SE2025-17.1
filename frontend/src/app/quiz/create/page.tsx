"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Eye, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1"
const QUIZ_API_URL = `${API_BASE_URL}/quizzes`
const USER_PROFILE_API_URL = `${API_BASE_URL}/users/profile`

type UserProfileApiResponse = {
  data?: {
    id: number
  }
}

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY"

type Answer = {
  id: string
  content: string
  isCorrect: boolean
}

type Question = {
  id: string
  content: string
  type: QuestionType
  points: number
  difficulty: "EASY" | "MEDIUM" | "HARD"
  tags: string[]
  answers: Answer[]
}

const difficulties = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" },
]

const generateId = () => Math.random().toString(36).substring(2, 9)

export default function QuizCreatePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY")
  const [timeLimit, setTimeLimit] = useState<string>("")
  const [maxAttempts, setMaxAttempts] = useState<string>("")
  const [isPublic, setIsPublic] = useState(true)

  const [quizTags, setQuizTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: generateId(),
      content: "",
      type: "MULTIPLE_CHOICE",
      points: 1,
      difficulty: "EASY",
      tags: [],
      answers: [
        { id: generateId(), content: "", isCorrect: true },
        { id: generateId(), content: "", isCorrect: false },
      ],
    },
  ])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = tagInput.trim()
      if (!value || quizTags.includes(value)) return
      setQuizTags([...quizTags, value])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setQuizTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: generateId(),
        content: "",
        type: "MULTIPLE_CHOICE",
        points: 1,
        difficulty: "EASY",
        tags: [],
        answers: [
          { id: generateId(), content: "", isCorrect: true },
          { id: generateId(), content: "", isCorrect: false },
        ],
      },
    ])
  }

  const handleRemoveQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error("Cần ít nhất 1 câu hỏi")
      return
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updater: (q: Question) => Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updater(q) : q)))
  }

  const handleQuestionTypeChange = (id: string, type: QuestionType) => {
    updateQuestion(id, (q) => {
      let answers = q.answers
      if (type === "ESSAY") {
        answers = []
      } else if (type === "TRUE_FALSE") {
        answers = [
          { id: generateId(), content: "Đúng", isCorrect: true },
          { id: generateId(), content: "Sai", isCorrect: false },
        ]
      } else if (type === "MULTIPLE_CHOICE" && q.answers.length === 0) {
        answers = [
          { id: generateId(), content: "", isCorrect: true },
          { id: generateId(), content: "", isCorrect: false },
        ]
      }
      return { ...q, type, answers }
    })
  }

  const handleAddAnswer = (questionId: string) => {
    updateQuestion(questionId, (q) => {
      if (q.type === "ESSAY" || q.type === "TRUE_FALSE") return q
      const newAnswer: Answer = {
        id: generateId(),
        content: "",
        isCorrect: false,
      }
      return { ...q, answers: [...q.answers, newAnswer] }
    })
  }

  const handleRemoveAnswer = (questionId: string, answerId: string) => {
    updateQuestion(questionId, (q) => {
      if (q.answers.length <= 2) {
        toast.error("Mỗi câu hỏi cần ít nhất 2 đáp án")
        return q
      }
      const nextAnswers = q.answers.filter((a) => a.id !== answerId)
      if (!nextAnswers.some((a) => a.isCorrect) && nextAnswers.length > 0) {
        nextAnswers[0] = { ...nextAnswers[0], isCorrect: true }
      }
      return { ...q, answers: nextAnswers }
    })
  }

  const handleSetCorrectAnswer = (questionId: string, answerId: string) => {
    updateQuestion(questionId, (q) => ({
      ...q,
      answers: q.answers.map((a) => ({ ...a, isCorrect: a.id === answerId })),
    }))
  }

  const handleQuestionTagInput = (questionId: string, value: string) => {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    updateQuestion(questionId, (q) => ({ ...q, tags }))
  }

  const buildPayload = () => {
    const payload = {
      title,
      description,
      topic,
      difficulty,
      timeLimit: Number(timeLimit) || 0,
      maxAttempts: Number(maxAttempts) || 0,
      isPublic,
      tags: quizTags,
      questions: questions.map((q) => ({
        content: q.content,
        type: q.type,
        points: q.points || 1,
        difficulty: q.difficulty,
        tags: q.tags,
        answers:
          q.type === "ESSAY"
            ? []
            : q.answers.map((a) => ({
              content: a.content,
              isCorrect: a.isCorrect,
            })),
      })),
    }

    return {
      ...payload,
      totalPoints: payload.questions.reduce((sum, q) => sum + q.points, 0),
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề quiz!")
      return false
    }
    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 câu hỏi!")
      return false
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.content.trim()) {
        toast.error(`Vui lòng nhập nội dung cho câu hỏi ${i + 1}!`)
        return false
      }
      if (q.type !== "ESSAY") {
        if (q.answers.length < 2) {
          toast.error(`Câu hỏi ${i + 1} phải có ít nhất 2 đáp án!`)
          return false
        }
        if (!q.answers.some((a) => a.isCorrect)) {
          toast.error(`Câu hỏi ${i + 1} phải có ít nhất 1 đáp án đúng!`)
          return false
        }
      }
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    const payload = buildPayload()

    // Lấy userId từ auth-service qua /users/profile
    let creatorId = 0
    try {
      const token =
        Cookies.get("accessToken") ||
        (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null)

      if (!token) {
        toast.error("Bạn cần đăng nhập để tạo quiz")
        router.push("/auth/login")
        return
      }

      const profileRes = await fetch(USER_PROFILE_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (profileRes.ok) {
        const profileJson = (await profileRes.json()) as UserProfileApiResponse
        if (profileJson.data?.id) {
          creatorId = profileJson.data.id
        }
      }
    } catch (e) {
      console.error("Fetch user profile error:", e)
      // Không chặn lưu nếu không lấy được id, nhưng creatorId sẽ là 0
    }

    // Map sang format backend quiz-service
    const body = {
      title: payload.title,
      description: payload.description,
      timeLimit: payload.timeLimit,
      totalPoints: payload.totalPoints,
      maxAttempts: payload.maxAttempts,
      isPublic: payload.isPublic,
      tags: payload.tags,
      topic: payload.topic,
      difficulty: payload.difficulty,
      creatorId,
      questions: payload.questions.map((q) => ({
        content: q.content,
        type: q.type,
        difficulty: q.difficulty,
        points: q.points,
        tags: q.tags,
        // Lưu luôn đáp án sang bảng answers thông qua GORM association
        answers:
          q.type === "ESSAY"
            ? []
            : q.answers.map((a) => ({
              content: a.content,
              isCorrect: a.isCorrect,
            })),
      })),
    }

    try {
      const res = await fetch(QUIZ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Lưu quiz thất bại")
      }

      toast.success("Lưu quiz thành công!")
      router.push("/latest")
    } catch (error: any) {
      console.error("Save quiz error:", error)
      toast.error(error.message || "Có lỗi xảy ra khi lưu quiz")
    }
  }

  const handlePreview = () => {
    const preview = {
      title: title || "Chưa có tiêu đề",
      description: description || "Chưa có mô tả",
      questions: questions.map((q, idx) => ({
        number: idx + 1,
        content: q.content || "Chưa có nội dung",
      })),
    }
    console.log("Preview:", preview)
    toast.info(`Xem trước quiz trong Console (tổng ${preview.questions.length} câu hỏi)`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-4 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-6 md:px-10">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span>📝</span>
            Tạo Quiz mới
          </h1>
          <p className="mt-2 text-sm md:text-base opacity-90">
            Thiết kế bài kiểm tra của bạn một cách dễ dàng và trực quan
          </p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
              <span>📋</span> Thông tin Quiz
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Tiêu đề Quiz *</Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề quiz..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-description">Mô tả</Label>
                <Textarea
                  id="quiz-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả về quiz này..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-topic">Chủ đề</Label>
                  <Input
                    id="quiz-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="VD: Toán học, Lịch sử..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-difficulty">Độ khó</Label>
                  <select
                    id="quiz-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {difficulties.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time-limit">Thời gian (phút)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Số lần làm tối đa</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min={1}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (nhấn Enter để thêm)</Label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Nhập tag và nhấn Enter..."
                />
                {quizTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quizTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white px-3 py-1 text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 font-bold"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="quiz-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="quiz-public" className="cursor-pointer">
                  Công khai quiz này
                </Label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
                <span>❓</span> Câu hỏi
              </h2>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="bg-emerald-500 hover:bg-emerald-600 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm câu hỏi
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <Card key={q.id} className="border-2 border-gray-100 shadow-sm">
                  <div className="p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-indigo-600 font-semibold">
                        Câu hỏi {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Loại câu hỏi</Label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleQuestionTypeChange(q.id, e.target.value as QuestionType)
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                          <option value="TRUE_FALSE">Đúng / Sai</option>
                          <option value="ESSAY">Tự luận</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Điểm</Label>
                          <Input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) =>
                              updateQuestion(q.id, (prev) => ({
                                ...prev,
                                points: Number(e.target.value) || 1,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Độ khó</Label>
                          <select
                            value={q.difficulty}
                            onChange={(e) =>
                              updateQuestion(q.id, (prev) => ({
                                ...prev,
                                difficulty: e.target.value as Question["difficulty"],
                              }))
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            {difficulties.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nội dung câu hỏi *</Label>
                      <Textarea
                        value={q.content}
                        onChange={(e) =>
                          updateQuestion(q.id, (prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="Nhập nội dung câu hỏi..."
                        className="min-h-[70px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        placeholder="VD: toán, hình học"
                        value={q.tags.join(", ")}
                        onChange={(e) => handleQuestionTagInput(q.id, e.target.value)}
                      />
                      <p className="text-xs text-gray-400">
                        Nhập nhiều tag, cách nhau bởi dấu phẩy
                      </p>
                    </div>

                    {q.type !== "ESSAY" && (
                      <div className="border-t pt-4 space-y-3">
                        <Label className="font-semibold">Đáp án</Label>
                        <div className="space-y-2">
                          {q.answers.map((a) => (
                            <div
                              key={a.id}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${a.isCorrect
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 bg-white"
                                }`}
                            >
                              <input
                                type="radio"
                                checked={a.isCorrect}
                                onChange={() => handleSetCorrectAnswer(q.id, a.id)}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                              />
                              <Input
                                value={a.content}
                                onChange={(e) =>
                                  updateQuestion(q.id, (prev) => ({
                                    ...prev,
                                    answers: prev.answers.map((ans) =>
                                      ans.id === a.id ? { ...ans, content: e.target.value } : ans,
                                    ),
                                  }))
                                }
                                placeholder="Nội dung đáp án..."
                                className="flex-1"
                              />
                              {q.type === "MULTIPLE_CHOICE" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAnswer(q.id, a.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.type === "MULTIPLE_CHOICE" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddAnswer(q.id)}
                            className="mt-1 border-dashed"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm đáp án
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-gray-50 border-t px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full md:w-auto">
            Quay lại
          </Button>
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={handlePreview} className="flex-1 md:flex-none">
              <Eye className="w-4 h-4 mr-1" />
              Xem trước
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 flex-1 md:flex-none"
            >
              <Save className="w-4 h-4 mr-1" />
              Lưu Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


