import { create } from 'zustand'
import { analyticsService, QuizReport, StudentReport, ClassReport, QuestionAnalysis, CrossComparison } from '@/services/analytics.service'

interface AnalyticsState {
    // Quiz Report
    quizReport: QuizReport | null
    isLoadingQuizReport: boolean
    quizReportError: string | null

    // Student Report
    studentReport: StudentReport | null
    isLoadingStudentReport: boolean
    studentReportError: string | null

    // Class Report
    classReport: ClassReport | null
    isLoadingClassReport: boolean
    classReportError: string | null

    // Question Analysis
    questionAnalysis: QuestionAnalysis | null
    isLoadingQuestionAnalysis: boolean
    questionAnalysisError: string | null

    // Cross Comparison
    crossComparison: CrossComparison | null
    isLoadingCrossComparison: boolean
    crossComparisonError: string | null

    // Actions
    fetchQuizReport: (quizId: number) => Promise<void>
    fetchStudentReport: (studentId: number) => Promise<void>
    fetchClassReport: (classId: number) => Promise<void>
    fetchQuestionAnalysis: (questionId: number) => Promise<void>
    fetchCrossComparison: (studentId: number, classId?: number) => Promise<void>
    exportCSV: (params?: any) => Promise<void>
    exportPDF: (params?: any) => Promise<void>
    clearErrors: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    // Initial state
    quizReport: null,
    isLoadingQuizReport: false,
    quizReportError: null,

    studentReport: null,
    isLoadingStudentReport: false,
    studentReportError: null,

    classReport: null,
    isLoadingClassReport: false,
    classReportError: null,

    questionAnalysis: null,
    isLoadingQuestionAnalysis: false,
    questionAnalysisError: null,

    crossComparison: null,
    isLoadingCrossComparison: false,
    crossComparisonError: null,

    // Actions
    fetchQuizReport: async (quizId: number) => {
        set({ isLoadingQuizReport: true, quizReportError: null })
        try {
            const report = await analyticsService.getQuizReport(quizId)
            set({ quizReport: report, isLoadingQuizReport: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải báo cáo quiz'
            console.error('Error fetching quiz report:', err)
            set({ quizReportError: errorMessage, isLoadingQuizReport: false })
        }
    },

    fetchStudentReport: async (studentId: number) => {
        set({ isLoadingStudentReport: true, studentReportError: null })
        try {
            const report = await analyticsService.getStudentReport(studentId)
            set({ studentReport: report, isLoadingStudentReport: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải báo cáo học sinh'
            console.error('Error fetching student report:', err)
            set({ studentReportError: errorMessage, isLoadingStudentReport: false })
        }
    },

    fetchClassReport: async (classId: number) => {
        set({ isLoadingClassReport: true, classReportError: null })
        try {
            const report = await analyticsService.getClassReport(classId)
            set({ classReport: report, isLoadingClassReport: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải báo cáo lớp học'
            console.error('Error fetching class report:', err)
            set({ classReportError: errorMessage, isLoadingClassReport: false })
        }
    },

    fetchQuestionAnalysis: async (questionId: number) => {
        set({ isLoadingQuestionAnalysis: true, questionAnalysisError: null })
        try {
            const analysis = await analyticsService.getQuestionAnalysis(questionId)
            set({ questionAnalysis: analysis, isLoadingQuestionAnalysis: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải phân tích câu hỏi'
            console.error('Error fetching question analysis:', err)
            set({ questionAnalysisError: errorMessage, isLoadingQuestionAnalysis: false })
        }
    },

    fetchCrossComparison: async (studentId: number, classId?: number) => {
        set({ isLoadingCrossComparison: true, crossComparisonError: null })
        try {
            const comparison = await analyticsService.getCrossComparison(studentId, classId)
            set({ crossComparison: comparison, isLoadingCrossComparison: false })
        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tải so sánh'
            console.error('Error fetching cross comparison:', err)
            set({ crossComparisonError: errorMessage, isLoadingCrossComparison: false })
        }
    },

    exportCSV: async (params?: any) => {
        try {
            const blob = await analyticsService.exportCSV(params)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err: any) {
            console.error('Error exporting CSV:', err)
            throw err
        }
    },

    exportPDF: async (params?: any) => {
        try {
            const blob = await analyticsService.exportPDF(params)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err: any) {
            console.error('Error exporting PDF:', err)
            throw err
        }
    },

    clearErrors: () => {
        set({
            quizReportError: null,
            studentReportError: null,
            classReportError: null,
            questionAnalysisError: null,
            crossComparisonError: null,
        })
    }
}))

