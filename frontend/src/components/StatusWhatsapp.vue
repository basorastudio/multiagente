<template>
  <div class="flex flex-inline q-gutter-sm">
    <div
      :key="wbot.id"
      v-for="wbot in whatsapps"
    >
      <q-btn
        :key="wbot.id"
        v-if="isIconStatusMenu"
        unelevated
        round
        flat
        :color="!isInvalidConnect(wbot) ? 'green' : 'negative'"
      >
        <q-icon
          v-if="!isInvalidConnect(wbot)"
          name="mdi-wifi-check"
          size="2em"
        />
        <div
          v-if="isInvalidConnect(wbot)"
          class="notification-box"
        >
          <div class="notification-bell">
            <span class="bell-top"></span>
            <span class="bell-middle"></span>
            <span class="bell-bottom"></span>
            <span class="bell-rad"></span>
          </div>
        </div>
        <q-menu
          anchor="top right"
          self="top left"
        >
          <ItemStatusWhatsapp
            :key="wbot.id"
            :wbot="wbot"
          />
        </q-menu>
      </q-btn>
    </div>

    <transition
      transition-show="flip-up"
      transition-hide="flip-down"
    >
      <q-carousel
        v-if="!isIconStatusMenu && whatsapps.length && isProblemConnect"
        ref="carouselStatusWhatsapp"
        v-model="idWbotVisible"
        transition-prev="slide-right"
        transition-next="slide-left"
        animated
        swipeable
        class="q-pa-none q-ma-none full-width bg-amber"
        height="90px"
      >
        <template v-for="(wbot, index) in whatsapps">
          <q-carousel-slide
            :key="wbot.id + index"
            :name="index"
            class="q-pa-none q-ma-none"
          >
            <ItemStatusWhatsapp :wbot="wbot" />
          </q-carousel-slide>
        </template>
        <template v-slot:control>
          <q-carousel-control
            position="bottom-right"
            :offset="[10, 40]"
            class="q-gutter-xs"
            v-if="isBtnSlider"
          >
            <q-btn
              round
              flat
              dense
              color="white"
              text-color="black"
              icon="arrow_left"
              @click="$refs.carouselStatusWhatsapp.previous()"
            />
            <q-btn
              round
              flat
              dense
              color="white"
              text-color="black"
              icon="arrow_right"
              @click="$refs.carouselStatusWhatsapp.next()"
            />
          </q-carousel-control>
        </template>
      </q-carousel>
    </transition>
    <!--
      <q-icon
        color="negative"
        size="2.5em"
        name="mdi-wifi-strength-1-alert"
        v-if="cProblemaConexao"
      >
        <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
          Verifique el celular, la conexión se perdió.
        </span>
        <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
          <span class="text-weight-medium"> Alternativas: </span>
          <span class="row col">
            1 - Intente cerrar y abrir nuevamente la aplicación de WhatsApp en el celular;
          </span>
          <span class="row col">
            2 - Asegúrese de que su celular esté conectado a internet y que WhatsApp esté abierto;
          </span>
          <span class="row col">
            3 - Recargue la página del sistema;
          </span>
          <span class="row col">
            4 - Haga clic en el botón 'Desconectar' para obtener un nuevo código QR.
          </span>
        </q-tooltip>
      </q-icon>
      <q-icon
        v-if="cQrCode"
        name="mdi-qrcode-scan"
        color="positive"
        size="2.5em"
      >
        <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
          Necesario leer el código QR en conexiones.
        </span>
        <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
          <span class="text-weight-medium"> Acción: </span>
          <span class="row col">
            1 - Acceda al menú Conexiones;
          </span>
          <span class="row col">
            2 - Haga clic en el botón azul "Código QR";
          </span>
          <span class="row col">
            3 - Lea el código QR generado con la aplicación de WhatsApp del celular y espere a que se establezca la conexión.
          </span>
        </q-tooltip>
      </q-icon>
      <q-icon
        v-if="cOpening"
        name="mdi-lan-connect"
        color="warning"
        size="2.5em"
      >
        <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
          Verifique el celular y la internet, la conexión se perdió. Intentando reconectar a WhatsApp.
        </span>
        <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
          <span class="text-weight-medium"> Acción: </span>
          <span class="row col">
            1 - Intente cerrar y abrir nuevamente la aplicación de WhatsApp en el celular;
          </span>
          <span class="row col">
            2 - Asegúrese de que su celular esté conectado a internet y que WhatsApp esté abierto;
          </span>
        </q-tooltip>
      </q-icon>
      <q-space />
      <q-btn
        class="bg-grey"
        round
      >
        <q-avatar size="32px">
          <q-icon name="mdi-account" />
        </q-avatar>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item-label header> ¡Hola! {{ usuario.name }} </q-item-label>
            <q-separator />
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

          </q-list>
        </q-menu>

      </q-btn> -->

  </div>
</template>

<script>
import ItemStatusWhatsapp from './ItemStatusWhatsapp'
import { mapGetters } from 'vuex'

export default {
  name: 'StatusWhatsapp',
  components: {
    ItemStatusWhatsapp
  },
  props: {
    isIconStatusMenu: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      idWbotVisible: 0,
      isProblemConnect: false
    }
  },
  watch: {
    whatsapps: {
      handler () {
        const problem = this.whatsapps.findIndex(w => w.status !== 'CONNECTED') !== -1
        setTimeout(() => {
          this.isProblemConnect = problem
        }, 3000)
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    isBtnSlider () {
      const len = this.whatsapps.filter(w => w.status !== 'CONNECTED')
      return len > 1
    }
  },
  methods: {
    isInvalidConnect (wbot) {
      const statusAlert = [
        'PAIRING',
        'TIMEOUT',
        'DISCONNECTED',
        'qrcode',
        'DESTROYED',
        'CONFLICT'
      ]
      const idx = statusAlert.findIndex(w => w === wbot.status)
      return (idx !== -1)
    }
  },
  mounted () {
    this.isProblemConnect = this.whatsapps.findIndex(w => w.status !== 'CONNECTED') !== -1
  }
}
</script>
