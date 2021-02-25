import { ApolloClient, FetchResult } from '@apollo/client';
import { ProvideAuthProps, UserAuth, UserAuthPrivate } from "./types";
export declare const pickUserAuthPrivateFromMe: (me: any) => UserAuthPrivate;
export declare const clearUserAuthPrivate: () => UserAuthPrivate;
export declare const queryMe: (client: ApolloClient<any>, user: UserAuth, setUser: Function) => Promise<FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>>;
export declare function ProvideAuth({ children, user }: ProvideAuthProps): any;
export declare function useAuth(): any;
//# sourceMappingURL=useAuth.d.ts.map