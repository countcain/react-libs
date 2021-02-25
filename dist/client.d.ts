import { ApolloClient } from '@apollo/client';
import { AcceptedLanguage } from './types';
export declare function createClient(config: {
    language: AcceptedLanguage;
    token?: string | null;
    qlHost?: string;
    agent?: string;
}): ApolloClient<any>;
//# sourceMappingURL=client.d.ts.map