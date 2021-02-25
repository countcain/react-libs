import React, { useContext, createContext, useState } from 'react'
import { ApolloClient, FetchResult, useApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import get from 'lodash/get'
import {
  AuthContext,
  OpenGraphContext,
  ProvideAuthProps,
  SetableKey,
  ThemeClass,
  UserAuth,
  UserAuthPrivate
} from "./types";

export const pickUserAuthPrivateFromMe = (me: any): UserAuthPrivate => ({
  email          : me.email,
  uniq           : me.uniq,
  admin          : me.admin,
  isAuthenticated: true,
})
export const clearUserAuthPrivate = (): UserAuthPrivate => ({
  email          : '',
  uniq           : '',
  admin          : false,
  isAuthenticated: false,
})

const CODE = gql`
  mutation($email: String!) {
    newSignInCode(email: $email) {
      success
      message
    }
  }
`
const TOKEN = gql`
  mutation($email: String!, $code: String!) {
    newAuthenticationToken(email: $email, code: $code) {
      success
      message
      token
    }
  }
`
const ME = gql`
  query {
    me {
      uniq
      email
      admin
    }
  }
`
const dev = process.env.NODE_ENV === 'development'
const authContext = createContext<AuthContext>({
  dev,
  user: {
    themeClass: 'light-color',
    ...clearUserAuthPrivate()
  },
  getEmailCode: () => Promise.resolve({}),
  signIn      : () => Promise.resolve({}),
  signOut     : () => {},
  setKey      : () => {},
})

export const queryMe = (
  client: ApolloClient<any>,
  user: UserAuth,
  setUser: Function
) => new Promise<FetchResult>((resolve, reject) => {
  client
    .query({
      query      : ME,
      fetchPolicy: 'network-only',
    })
    .then((res: FetchResult) => {
      const me = get(res, 'data.me')

      setUser({
        ...user,
        ...(me ? pickUserAuthPrivateFromMe(me) : clearUserAuthPrivate()),
      })
      resolve(res)
    })
    .catch(reject)
})

const removeToken = () => {
  localStorage.removeItem('token')
  window.token = ''
  fetch('/cookie', {
    method     : 'POST',
    credentials: 'same-origin',
    headers    : {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: 'r' })
  }).then(() => {}).catch(() => {})
}

function useProvideAuth (initUser: UserAuth) {
  const [user, setUser] = useState<UserAuth>(initUser)
  const client = useApolloClient()
  const signIn = (email: string, code: string) => new Promise<FetchResult>((resolve, reject) => {
    client.mutate({
      fetchPolicy: 'no-cache',
      mutation   : TOKEN,
      variables  : { email, code }
    })
      .then((res: FetchResult) => {
        const tokenRes = get(res, 'data.newAuthenticationToken')

        if (tokenRes && tokenRes.success) {
          fetch('/cookie', {
            method     : 'POST',
            credentials: 'same-origin',
            headers    : {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: tokenRes.token })
          }).then(() => {
            localStorage.setItem('token', tokenRes.token)
            queryMe(client, user, setUser).then(resolve).catch(reject)
          }).catch(reject)
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
  const signOut = (cb: Function) => {
    setUser({
      ...user,
      ...clearUserAuthPrivate(),
    })
    removeToken()
    cb()
  }
  const setKey = (key: SetableKey, value: ThemeClass|OpenGraphContext) => {
    const newUser = { ...user }

    switch (key) {
      case 'themeClass':
        newUser.themeClass = value as ThemeClass
        break
      case 'openGraphContext':
        newUser.openGraphContext = value as OpenGraphContext
        break
      default:
    }
    setUser(newUser)
  }
  const getEmailCode = (email: string) => client.mutate({
    fetchPolicy: 'no-cache',
    mutation   : CODE,
    variables  : { email }
  })

  if (typeof window !== 'undefined') {
    if (!user.isAuthenticated && localStorage.getItem('token')) {
      queryMe(client, user, setUser).then((qlRes) => {
        const me = get(qlRes, 'data.me')

        if (!me) {
          removeToken()
        }
      }).catch(() => {
        removeToken()
      })
    }
  }

  return {
    dev,
    user,
    signIn,
    signOut,
    setKey,
    getEmailCode
  }
}

export function ProvideAuth({ children, user }: ProvideAuthProps) {
  const auth = useProvideAuth(user || {
    themeClass: localStorage.getItem('themeClass') as ThemeClass || 'light-color',
    ...clearUserAuthPrivate()
  })

  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}

export function useAuth() {
  return useContext(authContext)
}
