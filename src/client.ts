import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  concat,
} from '@apollo/client'
import fetch from 'cross-fetch'
import { AcceptedLanguage } from './types'

export function createClient(config: {
  language: AcceptedLanguage
  token?: string | null
  qlHost?: string
  agent?: string
}) : ApolloClient<any> {
  const httpLink = new HttpLink({
    uri: config.qlHost,
    fetch
  })
  const authMiddleware = new ApolloLink((operation, forward) => {
    if (typeof window !== 'undefined') {
      config.token = localStorage.getItem('token') || config.token || null
    } else {
      config.token = config.token || null
    }
    const headers: {
      'o-lang': string
      authorization: string | null
      'user-agent'?: string
    } = {
      authorization: config.token,
      'o-lang'     : {
        en     : 'en-US',
        zh     : 'zh-CN',
        'zh-TW': 'zh-TW'
      }[config.language]
    }

    if (config.agent) {
      headers['user-agent'] = config.agent
    }
    operation.setContext({ headers })

    return forward(operation)
  })

  return new ApolloClient({
    link : concat(authMiddleware, httpLink),
    cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
  })
}
