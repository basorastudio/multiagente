import cInput from 'src/components/cInput'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { Dark, uid } from 'quasar'
import DatePick from 'src/components/cDatePick'
import cDateTimePick from 'src/components/cDateTimePick'

import { format, parseISO } from 'date-fns'
import es from 'date-fns/locale/es'
import { UpdateConfiguracoesUsuarios } from 'src/service/user'

const formatarValorMoeda = (num, black = false, intl = {}) => {
  const config = {
    language: 'es', // Mantener es para la funcionalidad de Intl.NumberFormat
    options: {
      // style: 'currency',
      // currency: 'BRL',
      // currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }
  }
  const intlConfig = {
    ...config,
    ...intl
  }
  const valor = Intl.NumberFormat(intlConfig.language, intlConfig.options).format(num)
  if (black && num <= 0.0) {
    return ''
  }
  return valor
}

const arredodar = (num, places) => {
  if (!('' + num).includes('e')) {
    return +(Math.round(num + 'e+' + places) + 'e-' + places)
  } else {
    const arr = ('' + num).split('e')
    let sig = ''
    if (+arr[1] + places > 0) {
      sig = '+'
    }
    return +(
      Math.round(+arr[0] + 'e' + sig + (+arr[1] + places)) +
      'e-' +
      places
    )
  }
}

const iniciaisString = nomecompleto => {
  nomecompleto = nomecompleto.replace(/\s(de|da|dos|das)\s/g, ' ') // Elimina los de, da, dos, das.
  const iniciais = nomecompleto.match(/\b(\w)/gi) // Iniciales de cada parte del nombre.
  // var nome = nomecompleto.split(' ')[0].toLowerCase() // Primer nombre.
  const sobrenomes = iniciais
    .splice(1, iniciais.length - 1)
    .join('')
    .toLowerCase() // Iniciales
  const iniciaisNome = iniciais + sobrenomes
  return iniciaisNome.toUpperCase()
}

const formatarData = (data, formato = 'dd/MM/yyyy') => {
  return format(parseISO(data), formato, { locale: es })
}

const setConfigsUsuario = ({ isDark }) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
    // date: new Date(),
  }
  // this.isDark = !this.isDark
  Dark.set(isDark)
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const filtrosAtendimento = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const data = {
    filtrosAtendimento,
    isDark: Dark.isActive
  }
  UpdateConfiguracoesUsuarios(usuario.userId, data)
    .then(r => console.log('Configuraciones de usuario actualizadas'))
    .catch(e => console.error)

  localStorage.setItem('usuario', JSON.stringify({ ...usuario, configs: data }))
}

export default ({
  Vue
}) => {
  Vue.component('cInput', cInput)
  Vue.component('DatePick', DatePick)
  Vue.component('cDateTimePick', cDateTimePick)
  Vue.prototype.$formatarValorMoeda = formatarValorMoeda
  Vue.prototype.$round = arredodar
  Vue.prototype.$formatarData = formatarData
  Vue.prototype.$iniciaisString = iniciaisString
  Vue.prototype.$notificarErro = notificarErro
  Vue.prototype.$notificarSucesso = notificarSucesso
  Vue.prototype.$setConfigsUsuario = setConfigsUsuario
  Vue.prototype.$uuid = uid
}
