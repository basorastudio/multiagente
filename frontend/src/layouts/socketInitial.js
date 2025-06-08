const usuario = JSON.parse(localStorage.getItem('usuario'))
import Router from 'src/router/index'
import { socketIO } from '../utils/socket'
import { ConsultarTickets } from 'src/service/tickets'

const socket = socketIO()

const userId = +localStorage.getItem('userId')

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  setTimeout(() => {
    Router.push({
      name: 'login'
    })
  }, 1000)
})

export default {
  methods: {
    socketInitial () {
      socket.emit(`${usuario.tenantId}:joinNotification`)

      socket.io.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        console.log('socket ON')
        if (data.type === 'chat:create') {
          console.log('chat:create')
          if (data.payload.ticket.userId !== userId) return
          if (data.payload.fromMe) return
          const message = new self.Notification('Contacto: ' + data.payload.ticket.contact.name, {
            body: 'Mensaje: ' + data.payload.body,
            tag: 'simple-push-demo-notification',
            image: data.payload.ticket.contact.profilePicUrl,
            icon: data.payload.ticket.contact.profilePicUrl
          })
          console.log(message)
          console.log('envió mensaje')
          // Actualiza notificaciones de mensaje
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: true,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
            // date: new Date(),
          }
          console.log('Definió parámetros')
          try {
            console.log('intento')
            const { data } = await ConsultarTickets(params)
            console.log('intento 1')
            this.countTickets = data.count // count total de tickets no status
            console.log('intento 2')
            // this.ticketsList = data.tickets
            this.$store.commit('UPDATE_NOTIFICATIONS', data)
            console.log('intento 3')
            // this.$store.commit('SET_HAS_MORE', data.hasMore)
            // console.log(this.notifications)
          } catch (err) {
            console.log('error intento')
            this.$notificarErro('Algún problema', err)
            console.error(err)
          }
        }
      })

      socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'delete') {
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
          this.$root.$emit('UPDATE_SESSION', data.session)
        }

        if (data.action === 'readySession') {
          this.$q.notify({
            position: 'top',
            icon: 'mdi-wifi-arrow-up-down',
            message: `La conexión con WhatsApp está lista y está habilitado para enviar y recibir mensajes. Conexión: ${data.session.name}. Número: ${data.session.number}.`,
            type: 'positive',
            color: 'primary',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }
      })

      socket.on(`${usuario.tenantId}:change_battery`, data => {
        this.$q.notify({
          message: `La batería del celular de WhatsApp ${data.batteryInfo.sessionName} está en ${data.batteryInfo.battery}%. Es necesario iniciar la carga.`,
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      })
      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        var verify = []
        if (data.type === 'notification:new') {
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['pending'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: false,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const data_noti = await ConsultarTickets(params)
            this.$store.commit('UPDATE_NOTIFICATIONS_P', data_noti.data)
            verify = data_noti
          } catch (err) {
            this.$notificarErro('Algún problema', err)
            console.error(err)
          }
          // Realiza una verificación para asegurarse de que la notificación pertenece a la cola del usuario
          var pass_noti = false
          verify.data.tickets.forEach((element) => { pass_noti = (element.id == data.payload.id ? true : pass_noti) })
          // Muestra Notificación
          if (pass_noti) {
            const message = new self.Notification('Nuevo cliente pendiente', {
              body: 'Cliente: ' + data.payload.contact.name,
              tag: 'simple-push-demo-notification'
            })
            console.log(message)
          }
        }
      })
    }
  },
  mounted () {
    this.socketInitial()
  },
  destroyed () {
    socket && socket.disconnect()
  }
}
