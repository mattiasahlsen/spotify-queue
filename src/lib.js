import store from './store'
import config from './config'
import { router } from './main'

export const checkStatus = async resp => {
  if (resp.status >= 400 && resp.status < 600) {
    const msg = resp.status + ' ' + resp.statusText
    try {
      const body = await resp.json()
      const err = body.error ? new Error(body.error.message) : new Error(msg)
      err.status = resp.status
      throw err
    } catch (error) {
      const err = Error(msg)
      err.status = resp.status
      throw err
    }
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
