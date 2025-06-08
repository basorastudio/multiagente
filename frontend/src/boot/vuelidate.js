import Vuelidate from 'vuelidate'
import VuelidateErrorExtractor from 'vuelidate-error-extractor'

import linkify from 'vue-linkify'

/* Necesitamos mensajes para la validación */
const messages = {
  required: '{attribute} es obligatorio',
  email: '{attribute} es inválido.',
  minValue: '{attribute} debe ser mayor que {min}',
  minLength: '{attribute} debe tener al menos {min} caracteres',
  maxLength: '{attribute} debe tener como máximo {min} caracteres',
  validaData: 'Fecha inválida'
}

const mapNames = {
  email: 'E-mail',
  name: 'Nombre',
  nome: 'Nombre',
  username: 'Usuario'
}

export default ({
  Vue
}) => {
  Vue.directive('linkified', linkify)
  Vue.use(Vuelidate)
  Vue.use(VuelidateErrorExtractor, {
    messages,
    attributes: mapNames
  })
}
