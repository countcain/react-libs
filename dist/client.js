"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const tslib_1 = require("tslib");
const client_1 = require("@apollo/client");
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
function createClient(config) {
    const httpLink = new client_1.HttpLink({
        uri: config.qlHost,
        fetch: cross_fetch_1.default
    });
    const authMiddleware = new client_1.ApolloLink((operation, forward) => {
        if (typeof window !== 'undefined') {
            config.token = localStorage.getItem('token') || config.token || null;
        }
        else {
            config.token = config.token || null;
        }
        const headers = {
            authorization: config.token,
            'o-lang': {
                en: 'en-US',
                zh: 'zh-CN',
                'zh-TW': 'zh-TW'
            }[config.language]
        };
        if (config.agent) {
            headers['user-agent'] = config.agent;
        }
        operation.setContext({ headers });
        return forward(operation);
    });
    return new client_1.ApolloClient({
        link: client_1.concat(authMiddleware, httpLink),
        cache: new client_1.InMemoryCache({ resultCaching: false, addTypename: false }),
    });
}
exports.createClient = createClient;
//# sourceMappingURL=client.js.map