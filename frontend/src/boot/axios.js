import { Loading, QSpinnerFacebook } from 'quasar'
// import { useRouter } from 'vue-router'

// const router = useRouter()

const onRequest = (config) => {
  // console.log('onRequest', config)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  Loading.show({
    message: 'Cargando...',
    spinnerColor: 'primary',
    spinner: QSpinnerFacebook
  })
  return config
}

const onResponse = (response) => {
  // console.log('onResponse', response)
  Loading.hide()
  return response
}

const onError = async (error) => {
  // console.log('onError', error.response)
  const errorStatusCode = error.response ? error.response.status : null
  const publicRoute = error.response?.config?.params?.isPublic
  if (errorStatusCode === 401 && !publicRoute) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('filtrosAtendimento')
    // router.push({ name: 'login' })
    window.location.reload()
  }
  Loading.hide()
  throw error
}

export { onRequest, onResponse, onError }
