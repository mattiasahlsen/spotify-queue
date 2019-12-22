import store from './store'

export const checkStatus = async resp => {
  if (resp.status >= 400 && resp.status < 600) {
    const msg = resp.status + ' ' + resp.statusText
    try {
      const body = await resp.json()
      if (body.error) throw new Error(body.error.message)
      else throw new Error(msg)
    } catch (err) {
      throw new Error(msg)
    }
  } else {
    return resp
  }
}

export const showErr = err => store.commit('error', err)
export const pass = () => {}
