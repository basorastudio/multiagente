<template>
  <q-layout view="hHh Lpr lFf">

    <q-header
      class="bg-white text-grey-8 q-py-xs "
      height-hint="58"
      bordered
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        >
          <q-tooltip>Menú</q-tooltip>
        </q-btn>

        <q-btn
          flat
          no-caps
          no-wrap
          dense
          class="q-ml-sm"
          v-if="$q.screen.gt.xs"
        >
          <q-img
            src="/logo_izing.png"
            spinner-color="primary"
            style="height: 50px; width: 140px"
          />
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
        <div v-if="userProfile === 'admin' || userProfile === 'user'">
          <q-btn
            round
            dense
            flat
            color="grey-8"
            icon="notifications"
          >
            <q-badge
              color="red"
              text-color="white"
              floating
              v-if="(parseInt(notifications.count) + parseInt(notifications_p.count)) > 0"
            >
              {{ parseInt(notifications.count) + parseInt(notifications_p.count) }}
            </q-badge>
            <q-menu>
              <q-list style="min-width: 300px">

                <q-item v-if="(parseInt(notifications.count) + parseInt(notifications_p.count)) == 0">
                  <q-item-section style="cursor: pointer;">
                    ¡Nada nuevo por aquí!
                  </q-item-section>
                </q-item>
                <q-item v-if="parseInt(notifications_p.count) > 0">
                  <q-item-section
                    avatar
                    @click="() => $router.push({ name: 'atendimento' })"
                    style="cursor: pointer;"
                  >
                    <q-avatar
                      style="width: 60px; height: 60px"
                      color="blue"
                      text-color="white"
                    >
                      {{ notifications_p.count }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section
                    @click="() => $router.push({ name: 'atendimento' })"
                    style="cursor: pointer;"
                  >
                    Clientes pendientes en la cola
                  </q-item-section>
                </q-item>
                <q-item
                  v-for="ticket in notifications.tickets"
                  :key="ticket.id"
                  style="border-bottom: 1px solid #ddd; margin: 5px;"
                >
                  <q-item-section
                    avatar
                    @click="abrirAtendimentoExistente(ticket.name, ticket)"
                    style="cursor: pointer;"
                  >
                    <q-avatar style="width: 60px; height: 60px">
                      <img :src="ticket.profilePicUrl">
                    </q-avatar>
                  </q-item-section>
                  <q-item-section
                    @click="abrirAtendimentoExistente(ticket.name, ticket)"
                    style="cursor: pointer;"
                  >
                    <q-list>
                      <q-item style="text-align:center; font-size: 17px; font-weight: bold; min-height: 0">{{ ticket.name
                      }}</q-item>
                      <q-item style="min-height: 0; padding-top: 0"><b>Mensaje: </b> {{ ticket.lastMessage }}</q-item>
                    </q-list>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>Notificaciones</q-tooltip>
          </q-btn>
          <q-avatar
            :color="usuario.status === 'offline' ? 'negative' : 'positive'"
            text-color="white"
            size="25px"
            :icon="usuario.status === 'offline' ? 'mdi-account-off' : 'mdi-account-check'"
            rounded
            class="q-ml-lg"
          >
            <q-tooltip>
              {{ usuario.status === 'offline' ? 'Usuario Offline' : 'Usuario Online' }}
            </q-tooltip>
          </q-avatar>
          </div>
          <q-btn
            round
            flat
            class="bg-padrao text-bold q-mx-sm q-ml-lg"
          >
            <q-avatar size="26px">
              {{ $iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header> ¡Hola! <b> {{ username }} </b> </q-item-label>

                <cStatusUsuario
                  @update:usuario="atualizarUsuario"
                  :usuario="usuario"
                />
                <q-item
                  clickable
                  v-close-popup
                  @click="abrirModalUsuario"
                >
                  <q-item-section>Perfil</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="efetuarLogout"
                >
                  <q-item-section>Salir</q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <cSystemVersion />
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>

            <q-tooltip>Usuario</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay
      content-class="bg-white text-grey-9"
    >
      <q-scroll-area class="fit">
        <q-list
          padding
          :key="userProfile"
        >
          <div v-if="userProfile === 'admin' || userProfile === 'user'">
          <EssentialLink v-for="item in menuData" :key="item.title" v-bind="item"/>
          </div>
          <div v-if="userProfile === 'admin'">
            <q-separator spaced />
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataAdmin">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>
          <div v-if="userProfile === 'super'">
            <!-- <q-separator spaced /> -->
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataSuper">
              <EssentialLink v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item" />
            </template>
          </div>

        </q-list>
      </q-scroll-area>
      <div
        class="absolute-bottom text-center row justify-start"
        :class="{ 'bg-grey-3': $q.dark.isActive }"
        style="height: 40px"
      >
        <q-toggle
          size="xl"
          keep-color
          dense
          class="text-bold q-ml-xs"
          :icon-color="$q.dark.isActive ? 'black' : 'white'"
          :value="$q.dark.isActive"
          :color="$q.dark.isActive ? 'grey-3' : 'black'"
          checked-icon="mdi-white-balance-sunny"
          unchecked-icon="mdi-weather-sunny"
          @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
        >
          <q-tooltip content-class="text-body1 hide-scrollbar">
            {{ $q.dark.isActive ? 'Desactivar' : 'Activar' }} Modo Oscuro (Dark Mode)
          </q-tooltip>
        </q-toggle>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view />
      </q-page>
    </q-page-container>
    <audio ref="audioNotification" v-if="userProfile === 'admin' || userProfile === 'user'">
      <source
        :src="alertSound"
        type="audio/mp3"
      >
    </audio>
    <ModalUsuario
      :isProfile="true"
      :modalUsuario.sync="modalUsuario"
      :usuarioEdicao.sync="usuario"
    />
  </q-layout>
</template>

<script>
import cSystemVersion from '../components/cSystemVersion.vue'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import EssentialLink from 'components/EssentialLink.vue'
import socketInitial from './socketInitial'
import alertSound from 'src/assets/sound.mp3'
import { format } from 'date-fns'
const username = localStorage.getItem('username')
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { RealizarLogout } from 'src/service/login'
import cStatusUsuario from '../components/cStatusUsuario.vue'
import { socketIO } from 'src/utils/socket'
import { ConsultarTickets } from 'src/service/tickets'

const socket = socketIO()

const objMenu = [
  {
    title: 'Dashboard',
    caption: '',
    icon: 'mdi-home',
    routeName: 'home-dashboard'
  },

  {
    title: 'Atenciones',
    caption: 'Lista de atenciones',
    icon: 'mdi-forum-outline',
    routeName: 'atendimento'
  },
  {
    title: 'Contactos',
    caption: 'Lista de contactos',
    icon: 'mdi-card-account-mail',
    routeName: 'contatos'
  }
]

const objMenuAdmin = [
  {
    title: 'Canales',
    caption: 'Canales de Comunicación',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessoes'
  },
  {
    title: 'Panel de Atenciones',
    caption: 'Visión general de las atenciones',
    icon: 'mdi-view-dashboard-variant',
    routeName: 'painel-atendimentos'
  },
  {
    title: 'Informes',
    caption: 'Informes generales',
    icon: 'mdi-file-chart',
    routeName: 'relatorios'
  },
  {
    title: 'Usuarios',
    caption: 'Admin de usuarios',
    icon: 'mdi-account-group',
    routeName: 'usuarios'
  },
  {
    title: 'Colas',
    caption: 'Registro de Colas',
    icon: 'mdi-arrow-decision-outline',
    routeName: 'filas'
  },
  {
    title: 'Mensajes Rápidos',
    caption: 'Mensajes predefinidos',
    icon: 'mdi-reply-all-outline',
    routeName: 'mensagens-rapidas'
  },
  {
    title: 'Chatbot',
    caption: 'Robot de atención',
    icon: 'mdi-robot',
    routeName: 'chat-flow'
  },
  {
    title: 'Etiquetas',
    caption: 'Registro de etiquetas',
    icon: 'mdi-tag-text',
    routeName: 'etiquetas'
  },
  {
    title: 'Horario de Atención',
    caption: 'Horario de funcionamiento',
    icon: 'mdi-calendar-clock',
    routeName: 'horarioAtendimento'
  },
  {
    title: 'Configuraciones',
    caption: 'Configuraciones generales',
    icon: 'mdi-cog',
    routeName: 'configuracoes'
  },
  {
    title: 'Campaña',
    caption: 'Campañas de envío',
    icon: 'mdi-message-bookmark-outline',
    routeName: 'campanhas'
  },
  {
    title: 'API',
    caption: 'Integración sistemas externos',
    icon: 'mdi-call-split',
    routeName: 'api-service'
  }
]

const superMenu = [
  {
    title: 'Empresas',
    caption: 'Admin de las Empresas',
    icon: 'mdi-office-building',
    routeName: 'empresassuper'
  },
  {
    title: 'Usuarios',
    caption: 'Admin de usuarios',
    icon: 'mdi-account-group',
    routeName: 'usuariossuper'
  },
  {
    title: 'Canales',
    caption: 'Canales de Comunicación',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessaosuper'
  }
]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario, cStatusUsuario, cSystemVersion },
  data () {
    return {
      username,
      domainExperimentalsMenus: ['@'],
      miniState: true,
      userProfile: 'user',
      modalUsuario: false,
      usuario: {},
      alertSound,
      leftDrawerOpen: false,
      menuData: objMenu,
      menuDataAdmin: objMenuAdmin,
      menuDataSuper: superMenu,
      countTickets: 0,
      ticketsList: []
    }
  },
  computed: {
    ...mapGetters(['notifications', 'notifications_p', 'whatsapps']),
    cProblemaConexao () {
      const idx = this.whatsapps.findIndex(w =>
        ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status)
      )
      return idx !== -1
    },
    cQrCode () {
      const idx = this.whatsapps.findIndex(
        w => w.status === 'qrcode' || w.status === 'DESTROYED'
      )
      return idx !== -1
    },
    cOpening () {
      const idx = this.whatsapps.findIndex(w => w.status === 'OPENING')
      return idx !== -1
    },
    cUsersApp () {
      return this.$store.state.usersApp
    },
    cObjMenu () {
      if (this.cProblemaConexao) {
        return objMenu.map(menu => {
          if (menu.routeName === 'sessoes') {
            menu.color = 'negative'
          }
          return menu
        })
      }
      return objMenu
    }
  },
  methods: {
    exibirMenuBeta (itemMenu) {
      if (!itemMenu?.isBeta) return true
      for (const domain of this.domainExperimentalsMenus) {
        if (this.usuario.email.indexOf(domain) !== -1) return true
      }
      return false
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    handlerNotifications (data) {
      const { message, contact, ticket } = data

      const options = {
        body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
        icon: contact.profilePicUrl,
        tag: ticket.id,
        renotify: true
      }

      const notification = new Notification(
        `Mensaje de ${contact.name}`,
        options
      )

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$router.push({ name: 'atendimento' })
      }
      this.$nextTick(() => {
        // utilizar refs del layout
        this.$refs.audioNotification.play()
      })
    },
    async abrirModalUsuario () {
      this.modalUsuario = true
    },
    async efetuarLogout () {
      try {
        await RealizarLogout(this.usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')

        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro('No fue posible realizar logout', error)
      }
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    },
    conectarSocket (usuario) {
      socket.on(`${usuario.tenantId}:chat:updateOnlineBubbles`, data => {
        this.$store.commit('SET_USERS_APP', data)
      })
    },
    atualizarUsuario () {
      this.usuario = JSON.parse(localStorage.getItem('usuario'))
      if (this.usuario.status === 'offline') {
        socket.emit(`${this.usuario.tenantId}:setUserIdle`)
      }
      if (this.usuario.status === 'online') {
        socket.emit(`${this.usuario.tenantId}:setUserActive`)
      }
    },
    async consultarTickets () {
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
      }
      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // count total de tickets en el estado
        this.$store.commit('UPDATE_NOTIFICATIONS', data)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
      const params2 = {
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
        const { data } = await ConsultarTickets(params2)
        this.countTickets = data.count // count total de tickets en el estado
        this.$store.commit('UPDATE_NOTIFICATIONS_P', data)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
    },
    abrirChatContato (ticket) {
      // si está en tamaño móvil, cerrar el drawer de contactos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente (contato, ticket) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `${contato} tiene una atención en curso (Atención: ${ticket.id}). ¿Desea abrir la atención?`,
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            'No fue posible actualizar el token',
            error
          )
        }
      })
    }
  },
  async mounted () {
    this.atualizarUsuario()
    await this.listarWhatsapps()
    await this.listarConfiguracoes()
    await this.consultarTickets()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    await this.conectarSocket(this.usuario)
  },
  destroyed () {
    socket.disconnect()
  }
}
</script>
<style scoped>
.q-img__image {
  background-size: contain;
}
</style>
