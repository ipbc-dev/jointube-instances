import Vue from 'vue'
import { AxiosError } from 'axios'

function buildApiUrl (path: string) {
  const normalizedPath = path.startsWith('/') ? path : '/' + path
  if (Vue.config.productionTip) return normalizedPath

  return process.env.VUE_APP_API_URL + normalizedPath
}

function httpErrorToString (error: AxiosError) {
  if (error.response) {
    if (error.response.status === 404) {
      return 'Not found.'
    }

    if (error.response.status === 500) {
      return 'Unknown server error.'
    }

    const json = error.response.data

    if (json.error) return json.error

    if (json.errors) {
      return Object.keys(json.errors)
        .map(k => json.errors[k].msg)
        .join('. ')
    }
    return error.response.data
  }

  return 'Unknown error'
}

export {
  buildApiUrl,
  httpErrorToString
}

