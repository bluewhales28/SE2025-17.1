import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import { AuthRequest, RegisterRequest } from '@/types/auth'
import Cookies from 'js-cookie'
import { getUserInfoFromToken, UserInfo } from '@/lib/jwt'

interface AuthState {
    user: UserInfo | null
    isLoading: boolean
    error: string | null

    // Actions
    initializeUser: () => void
    login: (data: AuthRequest) => Promise<any>
    register: (data: RegisterRequest) => Promise<any>
    logout: () => Promise<void>
    setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    initializeUser: () => {
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
        if (token) {
            const userInfo = getUserInfoFromToken(token)
            console.log('🔄 Initialize User:', userInfo)
            set({ user: userInfo })
        }
    },

    login: async (data: AuthRequest) => {
        set({ isLoading: true, error: null })
        try {
            const response = await authService.login(data)
            if (response.data?.token) {
                Cookies.set('accessToken', response.data.token, { expires: 1 })
                localStorage.setItem('accessToken', response.data.token)

                const userInfo = getUserInfoFromToken(response.data.token)
                console.log('🔐 Login - User Info:', userInfo)
                set({ user: userInfo, isLoading: false })
            }
            return response
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra'
            set({ error: errorMessage, isLoading: false })
            throw err
        }
    },

    register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
            const response = await authService.register(data)
            set({ isLoading: false })
            return response
        } catch (err: any) {
            const errorMessage = err.message || 'Có lỗi xảy ra'
            set({ error: errorMessage, isLoading: false })
            throw err
        }
    },

    logout: async () => {
        set({ isLoading: true })
        try {
            const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
            if (token) {
                await authService.logout(token)
            }
        } catch (err: any) {
            console.error('Logout API error:', err)
        } finally {
            Cookies.remove('accessToken')
            localStorage.removeItem('accessToken')
            set({ user: null, isLoading: false })
            window.location.href = '/'
        }
    },

    setError: (error: string | null) => {
        set({ error })
    }
}))
