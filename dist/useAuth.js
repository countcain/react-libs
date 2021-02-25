"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.ProvideAuth = exports.queryMe = exports.clearUserAuthPrivate = exports.pickUserAuthPrivateFromMe = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const client_1 = require("@apollo/client");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const get_1 = tslib_1.__importDefault(require("lodash/get"));
const pickUserAuthPrivateFromMe = (me) => ({
    email: me.email,
    uniq: me.uniq,
    admin: me.admin,
    isAuthenticated: true,
});
exports.pickUserAuthPrivateFromMe = pickUserAuthPrivateFromMe;
const clearUserAuthPrivate = () => ({
    email: '',
    uniq: '',
    admin: false,
    isAuthenticated: false,
});
exports.clearUserAuthPrivate = clearUserAuthPrivate;
const CODE = graphql_tag_1.default `
  mutation($email: String!) {
    newSignInCode(email: $email) {
      success
      message
    }
  }
`;
const TOKEN = graphql_tag_1.default `
  mutation($email: String!, $code: String!) {
    newAuthenticationToken(email: $email, code: $code) {
      success
      message
      token
    }
  }
`;
const ME = graphql_tag_1.default `
  query {
    me {
      uniq
      email
      admin
    }
  }
`;
const dev = process.env.NODE_ENV === 'development';
const authContext = react_1.createContext({
    dev,
    user: Object.assign({ themeClass: 'light-color' }, exports.clearUserAuthPrivate()),
    getEmailCode: () => Promise.resolve({}),
    signIn: () => Promise.resolve({}),
    signOut: () => { },
    setKey: () => { },
});
const queryMe = (client, user, setUser) => new Promise((resolve, reject) => {
    client
        .query({
        query: ME,
        fetchPolicy: 'network-only',
    })
        .then((res) => {
        const me = get_1.default(res, 'data.me');
        setUser(Object.assign(Object.assign({}, user), (me ? exports.pickUserAuthPrivateFromMe(me) : exports.clearUserAuthPrivate())));
        resolve(res);
    })
        .catch(reject);
});
exports.queryMe = queryMe;
const removeToken = () => {
    localStorage.removeItem('token');
    window.token = '';
    fetch('/cookie', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: 'r' })
    }).then(() => { }).catch(() => { });
};
function useProvideAuth(initUser) {
    const [user, setUser] = react_1.useState(initUser);
    const client = client_1.useApolloClient();
    const signIn = (email, code) => new Promise((resolve, reject) => {
        client.mutate({
            fetchPolicy: 'no-cache',
            mutation: TOKEN,
            variables: { email, code }
        })
            .then((res) => {
            const tokenRes = get_1.default(res, 'data.newAuthenticationToken');
            if (tokenRes && tokenRes.success) {
                fetch('/cookie', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: tokenRes.token })
                }).then(() => {
                    localStorage.setItem('token', tokenRes.token);
                    exports.queryMe(client, user, setUser).then(resolve).catch(reject);
                }).catch(reject);
            }
            else {
                resolve(res);
            }
        })
            .catch(reject);
    });
    const signOut = (cb) => {
        setUser(Object.assign(Object.assign({}, user), exports.clearUserAuthPrivate()));
        removeToken();
        cb();
    };
    const setKey = (key, value) => {
        const newUser = Object.assign({}, user);
        switch (key) {
            case 'themeClass':
                newUser.themeClass = value;
                break;
            case 'openGraphContext':
                newUser.openGraphContext = value;
                break;
            default:
        }
        setUser(newUser);
    };
    const getEmailCode = (email) => client.mutate({
        fetchPolicy: 'no-cache',
        mutation: CODE,
        variables: { email }
    });
    if (typeof window !== 'undefined') {
        if (!user.isAuthenticated && localStorage.getItem('token')) {
            exports.queryMe(client, user, setUser).then((qlRes) => {
                const me = get_1.default(qlRes, 'data.me');
                if (!me) {
                    removeToken();
                }
            }).catch(() => {
                removeToken();
            });
        }
    }
    return {
        dev,
        user,
        signIn,
        signOut,
        setKey,
        getEmailCode
    };
}
function ProvideAuth({ children, user }) {
    const auth = useProvideAuth(user || Object.assign({ themeClass: localStorage.getItem('themeClass') || 'light-color' }, exports.clearUserAuthPrivate()));
    return (react_1.default.createElement(authContext.Provider, { value: auth }, children));
}
exports.ProvideAuth = ProvideAuth;
function useAuth() {
    return react_1.useContext(authContext);
}
exports.useAuth = useAuth;
//# sourceMappingURL=useAuth.js.map