import axios from 'axios'
import qs from 'qs'
import window from 'global/window'

export function createHttpClient ({ baseURL = '' } = {}) {
  const http = axios.create({
    baseURL,
    paramsSerializer: params => qs.stringify(params, { indices: false }),
    withCredentials: true,
    headers: {
      common: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache' // eslint-disable-line quote-props
      }
    }
  })

  http.interceptors.request.use(function (config) {
    const delay = window.localStorage && (window.localStorage.getItem('http.delay') || 0)
    return new Promise(resolve => setTimeout(() => resolve(config), delay))
  })

  return http
}

export default createHttpClient({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8088' })
