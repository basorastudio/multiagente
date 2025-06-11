import { format, parseISO, parseJSON } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import es from 'date-fns/locale/es'
import { mapGetters } from 'vuex'

// Obtener zona horaria del navegador o usar una por defecto
const getLocalTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo'
}

export default {
  computed: {
    ...mapGetters(['mensagensTicket', 'ticketFocado', 'hasMore'])
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 200)
    },
    dataInWords (date) {
      try {
        const timeZone = getLocalTimeZone()
        let dateObj

        if (typeof date === 'string') {
          dateObj = parseISO(date)
        } else if (typeof date === 'number') {
          dateObj = new Date(date)
        } else {
          dateObj = parseJSON(date)
        }

        // Convertir a zona horaria local y formatear
        const zonedDate = utcToZonedTime(dateObj, timeZone)
        return format(zonedDate, 'HH:mm', { locale: es })
      } catch (error) {
        console.error('Error formatting date:', error)
        return format(new Date(), 'HH:mm', { locale: es })
      }
    },
    farmatarMensagemWhatsapp (body) {
      if (!body) return
      let format = body
      function is_aplhanumeric (c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
      function whatsappStyles (format, wildcard, opTag, clTag) {
        var indices = []
        for (var i = 0; i < format.length; i++) {
          if (format[i] === wildcard) {
            // eslint-disable-next-line no-unused-expressions
            if (indices.length % 2) { (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_aplhanumeric(format[i + 1]) ? null : indices.push(i))) } else { (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_aplhanumeric(format[i - 1])) ? null : indices.push(i))) }
          } else {
            // eslint-disable-next-line no-unused-expressions
            (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
          }
        }
        // eslint-disable-next-line no-unused-expressions
        (indices.length % 2) ? indices.pop() : null // Remueve el último índice si es impar, es decir, un comodín de apertura sin cierre.
        var e = 0
        indices.forEach(function (v, i) {
          var t = (i % 2) ? clTag : opTag
          v += e
          format = format.substr(0, v) + t + format.substr(v + 1)
          e += (t.length - 1)
        })
        return format
      }
      format = whatsappStyles(format, '_', '<i>', '</i>')
      format = whatsappStyles(format, '*', '<b>', '</b>')
      format = whatsappStyles(format, '~', '<s>', '</s>')
      format = format.replace(/\n/gi, '<br>')
      return format
    },
    formatarData (data, formato = 'dd/MM/yyyy') {
      try {
        const timeZone = getLocalTimeZone()
        let dateObj

        if (typeof data === 'string') {
          dateObj = parseISO(data)
        } else if (typeof data === 'number') {
          dateObj = new Date(data)
        } else {
          dateObj = data
        }

        // Convertir a zona horaria local y formatear
        const zonedDate = utcToZonedTime(dateObj, timeZone)
        return format(zonedDate, formato, { locale: es })
      } catch (error) {
        console.error('Error formatting date:', error)
        return format(parseISO(data), formato, { locale: es })
      }
    }
  }
}
