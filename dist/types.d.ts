import { ReactNodeArray, ReactNode } from 'react';
import { FetchResult } from "@apollo/client";
export declare type FeedbackMessageLevel = 'success' | 'danger' | 'warning';
export declare type ThemeClass = 'light-color' | 'dark-color' | 'auto-color';
export declare type AcceptedLanguage = 'en' | 'zh' | 'zh-TW';
export declare type SetableKey = 'themeClass' | 'openGraphContext';
export interface FeedbackState {
    msg: string;
    level: FeedbackMessageLevel;
}
export interface UserAuthPrivate {
    email?: string;
    uniq?: string;
    admin: boolean;
    isAuthenticated: boolean;
}
export interface OpenGraphContext {
    url?: string;
    type?: string;
    title?: string;
    description?: string;
    image?: string;
}
export interface UserAuth extends UserAuthPrivate {
    themeClass: ThemeClass;
    openGraphContext?: OpenGraphContext;
}
export interface AuthContext {
    dev: boolean;
    user: UserAuth;
    setKey(key: SetableKey, value: ThemeClass | OpenGraphContext): void;
    getEmailCode(email: string): Promise<FetchResult>;
    signIn(email: string, code: string): Promise<FetchResult>;
    signOut: Function;
}
export interface ProvideAuthProps {
    children: ReactNode | ReactNodeArray;
    user?: UserAuth;
}
//# sourceMappingURL=types.d.ts.map