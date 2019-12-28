import store from './store'
import config from './config'
import { router } from './main'

export const checkStatus = async resp => {
  if (resp.status >= 400 && resp.status < 600) {
    let msg
    if (resp.status === 401) msg = 'You must be connected to Spotify to do that'
    else msg = 'An error has occured on the server.'

    try {
      const body = await resp.json()
      if (typeof body.error === 'string') msg = body.error
    } catch (err) {}

    const err = new Error(msg)
    err.status = resp.status
    throw err
  } else {
    return resp
  }
}

export const showErr = err => store.commit('error', err)
export const pass = () => {}

export const queueUrl = path => {
  const url = new URL(config.server + path)
  url.searchParams.append('queueId', router.currentRoute.params.queueId)
  return url
}
export const queueId = () => router.currentRoute.params.queueId

export const serverFetchOptions = {
  credentials: 'include',
  headers: { 'Content-type': 'application/json' }
}
