import { ReactNodeArray, ReactNode } from 'react'
import {FetchResult} from "@apollo/client"

export type FeedbackMessageLevel = 'success' | 'danger' | 'warning'
export type ThemeClass = 'light-color' | 'dark-color' | 'auto-color'
export type AcceptedLanguage = 'en' | 'zh' | 'zh-TW'
export type SetableKey = 'themeClass' | 'openGraphContext'

export interface FeedbackState {
  msg: string
  level: FeedbackMessageLevel
}
export interface UserAuthPrivate {
  email?: string
  uniq?: string
  admin: boolean
  isAuthenticated: boolean
}
export interface OpenGraphContext {
  url?: string
  type?: string
  title?: string
  description?: string
  image?: string
}
export interface UserAuth extends UserAuthPrivate {
  themeClass: ThemeClass
  openGraphContext?: OpenGraphContext
}

export interface AuthContext {
  dev: boolean
  user: UserAuth
  setKey(key: SetableKey, value: ThemeClass|OpenGraphContext): void
  getEmailCode(email: string): Promise<FetchResult>
  signIn(email: string, code: string): Promise<FetchResult>
  signOut: Function
}

export interface ProvideAuthProps {
  children: ReactNode | ReactNodeArray,
  user?: UserAuth
}

