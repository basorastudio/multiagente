<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <template v-for="(mensagem, index) in       mensagens      ">
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        >
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div
            :key="`ref-${mensagem.createdAt}`"
            ref="lastMessageRef"
            id="lastMessageRef"
            style="float: 'left', background: 'black', clear: 'both'"
          />
        </template>
        <div
          :key="`chat-message-${mensagem.id}`"
          :id="`chat-message-${mensagem.id}`"
        />
        <q-chat-message
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem == `chat-message-${mensagem.id}` }"
        >
          <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
          <div
            style="min-width: 100px; max-width: 350px;"
            :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
          >
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                  'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                  'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe
                }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click.native="verificarEncaminharMensagem(mensagem)"
              :value="false"
            />

            <q-icon
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                  'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                  'text-positive': !['pending', 'canceled'].includes(mensagem.status)
                }"
              v-if="mensagem.scheduleDate"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">
                  Mensaje programado
                </div>
                <div
                  class="row col"
                  v-if="mensagem.isDeleted"
                >
                  <q-chip
                    color="red-3"
                    icon="mdi-trash-can-outline"
                  >
                    Envío cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip
                    color="blue-1"
                    icon="mdi-calendar-import"
                  >
                    Creado en: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip
                    color="blue-1"
                    icon="mdi-calendar-start"
                  >
                    Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>
            <div v-if="mensagem.edited" class="text-italic">
              Editada: {{ mensagem.edited }}
            </div>
            <div v-if="mensagem.edited" class="text-italic">
              Mensaje anterior:<br>
            </div>
            <div
              v-if="mensagem.isDeleted"
              class="text-italic"
            >
              Mensaje eliminado el {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div>
            <div v-if="isGroupLabel(mensagem)"
                 class="q-mb-sm"
                 style="display: flex; align-items: center; color: rgb(59 23 251); fontWeight: 500;">
              <q-avatar v-if="mensagem.contact && mensagem.contact.profilePicUrl"
                        size="40px"
                        class="q-mr-sm">
                <img :src="mensagem.contact.profilePicUrl" alt="Profile Picture">
              </q-avatar>
              {{ isGroupLabel(mensagem) }}
            </div>
            <div v-if="mensagem.quotedMsg" :class="{ textContentItem: !mensagem.isDeleted, textContentItemDeleted: mensagem.isDeleted }" @click="focarMensagem(mensagem.quotedMsg)">
              <MensagemRespondida
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                :mensagem="mensagem.quotedMsg"
              />
            </div>
            <q-btn
              v-if=" !mensagem.isDeleted && isShowOptions "
              class="absolute-top-right mostar-btn-opcoes-chat"
              dense
              flat
              ripple
              round
              icon="mdi-chevron-down"
            >
              <q-menu
                square
                auto-close
                anchor="bottom left"
                self="top left"
              >
                <q-list style="min-width: 100px">
                  <q-item
                    :disable=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) "
                    clickable
                    @click=" citarMensagem(mensagem) "
                  >
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) ">
                      Disponible solo para WhatsApp y Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item
                    clickable
                    @click=" encaminharMensagem(mensagem) "
                  >
                    <q-item-section>Reenviar</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click=" marcarMensagensParaEncaminhar(mensagem) "
                  >
                    <q-item-section>Marcar (reenviar varios)</q-item-section>
                  </q-item>
                  <q-item
                    @click=" AbrirmodaleditarMensagem(mensagem) "
                    clickable
                    v-if=" mensagem.fromMe  && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Editar Mensaje</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    @click=" deletarMensagem(mensagem) "
                    clickable
                    v-if=" mensagem.fromMe "
                    :disable=" isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger' "
                  >
                    <q-item-section>
                      <q-item-label>Eliminar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon
              v-if=" mensagem.fromMe "
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name=" ackIcons[mensagem.ack] "
              size="1.2em"
              :color=" mensagem.ack >= 3 ? 'blue-12' : '' "
            />
            <template v-if="mensagem.mediaType === 'audio'">
              <AudioVisualizer
                :url="mensagem.mediaUrl"
                :contact="mensagem.contact"
                :fromMe="mensagem.fromMe"
                :avatar-src="mensagem.fromMe ? $store.state.usuario?.profileImage : mensagem.contact?.profilePicUrl"
              />
            </template>
            <template v-if=" mensagem.mediaType === 'vcard' ">
              <div style="min-width: 250px;">
                <ContatoCard
                  :mensagem="mensagem"
                  @openContactModal="openContactModal"
                />
                <ContatoModal
                  :value="modalContato"
                  :contact="currentContact"
                  @close="closeModal"
                  @saveContact="saveContact"
                />
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'location'">
              <q-img
                @click=" urlMedia = mensagem.mediaUrl; abrirModalImagem = false "
                src="../../assets/localizacao.png"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if=" mensagem.mediaType === 'image' ">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                @click=" urlMedia = mensagem.mediaUrl; abrirModalImagem = true "
                :src=" mensagem.mediaUrl "
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
              <VueEasyLightbox
                moveDisabled
                :visible=" abrirModalImagem "
                :imgs=" urlMedia "
                :index=" mensagem.ticketId || 1 "
                @hide=" abrirModalImagem = false "
              />
            </template>
            <template v-if=" mensagem.mediaType === 'video' ">
              <video
                :src=" mensagem.mediaUrl "
                controls
                class="q-mt-md"
                style="objectFit: cover;
                  width: 330px;
                  height: 150px;
                  borderTopLeftRadius: 8px;
                  borderTopRightRadius: 8px;
                  borderBottomLeftRadius: 8px;
                  borderBottomRightRadius: 8px;
                "
              >
              </video>
            </template>
            <div v-if="mensagem.mediaType === 'reaction'" class="reaction-container q-mt-xs">
              {{ mensagem.body }}
            </div>
            <template v-if=" !['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType) && mensagem.mediaUrl ">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <iframe
                  v-if=" isPDF(mensagem.mediaUrl) "
                  frameBorder="0"
                  scrolling="no"
                  style="
                    width: 330px;
                    height: 150px;
                    overflow-y: hidden;
                    -ms-overflow-y: hidden;
                  "
                  class="no-scroll hide-scrollbar"
                  :src=" mensagem.mediaUrl "
                  id="frame-pdf"
                >
                  Descargar PDF
                  <!-- alt : <a href="mensagem.mediaUrl"></a> -->
                </iframe>
                <q-btn
                  type="a"
                  :color=" $q.dark.isActive ? '' : 'grey-3' "
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded  text-grey-9 ellipsis"
                  download
                  :target=" isPDF(mensagem.mediaUrl) ? '_blank' : '' "
                  :href=" mensagem.mediaUrl "
                >
                  <q-tooltip
                    v-if=" mensagem.mediaUrl "
                    content-class="text-bold"
                  >
                    Descargar: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs ">
                    <div
                      class="ellipsis col-grow q-pr-sm"
                      style="max-width: 290px"
                    >
                      {{ farmatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
            </template>
            <div
              v-linkified
              v-if=" !['vcard', 'application', 'audio', 'reaction'].includes(mensagem.mediaType) "
              :class=" { 'q-mt-sm': mensagem.mediaType !== 'chat' } "
              class="q-message-container row items-end no-wrap"
            >
              <div v-html=" farmatarMensagemWhatsapp(mensagem.body) ">
              </div>
            </div>
          </div>
        </q-chat-message>
      </template>
    </transition-group>
    <q-dialog v-model="showModaledit">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Mensaje</div>
        </q-card-section>
        <q-card-section>
          <q-input filled v-model="mensagemAtual.body" label="Mensaje" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Guardar" color="primary" @click="salvarMensagem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import mixinCommon from './mixinCommon'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida'
import ContatoCard from './ContatoCard.vue'
import ContatoModal from './ContatoModal.vue'
import AudioVisualizer from '../../components/AudioVisualizer.vue'
const downloadImageCors = axios.create({
  baseURL: process.env.VUE_URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})
import { DeletarMensagem, EditarMensagem } from 'src/service/tickets'
import { Base64 } from 'js-base64'
export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagem: {
      type: Object,
      required: true
    },
    mensagens: {
      type: Array,
      default: () => []
    },
    mensagensParaEncaminhar: {
      type: Array,
      default: () => []
    },
    size: {
      type: [String, Number],
      default: '5'
    },
    isLineDate: {
      type: Boolean,
      default: true
    },
    isShowOptions: {
      type: Boolean,
      default: true
    },
    ativarMultiEncaminhamento: {
      type: Boolean,
      default: false
    },
    replyingMessage: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      modalContato: false,
      currentContact: {},
      mensagemAtual: { body: '' },
      showModaledit: false,
      abrirModalImagem: false,
      urlMedia: '',
      identificarMensagem: null,
      ackIcons: { // Si ACK == 3 o 4 entonces color verde
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all'
      }
    }
  },
  components: {
    VueEasyLightbox,
    MensagemRespondida,
    ContatoCard,
    ContatoModal,
    AudioVisualizer
  },
  methods: {
    openContactModal (contact) {
      this.currentContact = contact
      this.modalContato = true
    },
    closeModal () {
      this.modalContato = false
    },
    saveContact (contact) {
      console.log('Contacto guardado:', contact)
      // Aquí puedes agregar la lógica para guardar el contacto
    },
    async salvarMensagem () {
      try {
        const updatedMessage = await EditarMensagem({
          id: this.mensagemAtual.id,
          messageId: this.mensagemAtual.messageId,
          body: this.mensagemAtual.body
        })
        console.log('Mensaje editado con éxito')
        this.showModaledit = false
        this.atualizarMensagem(updatedMessage)
      } catch (error) {
        console.error('Error al editar el mensaje', error.message)
        this.$notificarErro('No se pudo editar el mensaje')
      }
    },
    atualizarMensagem (updatedMessage) {
      const index = this.mensagens.findIndex(mensagem => mensagem.id === updatedMessage.id)
      if (index !== -1) {
        this.mensagens.splice(index, 1, updatedMessage)
      }
    },
    AbrirmodaleditarMensagem (mensagem) {
      this.mensagemAtual = mensagem
      this.showModaledit = true
    },
    verificarEncaminharMensagem (mensagem) {
      const mensagens = [...this.mensagensParaEncaminhar]
      const msgIdx = mensagens.findIndex(m => m.id === mensagem.id)
      if (msgIdx !== -1) {
        mensagens.splice(msgIdx, 1)
      } else {
        if (this.mensagensParaEncaminhar.length > 9) {
          this.$notificarErro('Permitido un máximo de 10 mensajes.')
          return
        }
        mensagens.push(mensagem)
      }
      this.$refs[`box-chat-message-${mensagem.id}`][0].value = !this.$refs[`box-chat-message-${mensagem.id}`][0].value
      this.$emit('update:mensagensParaEncaminhar', mensagens)
    },
    marcarMensagensParaEncaminhar (mensagem) {
      this.$emit('update:mensagensParaEncaminhar', [])
      this.$emit('update:ativarMultiEncaminhamento', !this.ativarMultiEncaminhamento)
      // this.verificarEncaminharMensagem(mensagem)
    },
    isPDF (url) {
      if (!url) return false
      const split = url.split('.')
      const ext = split[split.length - 1]
      return ext === 'pdf'
    },
    isGroupLabel (mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    returnCardContato (str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    isDesactivatDelete (msg) {
      return false
    },
    async buscarImageCors (imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers['content-type'] })
        )
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro('¡Ocurrió un error!', error)
      }
      this.loading = false
    },
    citarMensagem (mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      this.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    encaminharMensagem (mensagem) {
      this.$emit('mensagem-chat:encaminhar-mensagem', mensagem)
    },
    deletarMensagem (mensagem) {
      if (this.isDesactivatDelete(mensagem)) {
        this.$notificarErro('No se pudo eliminar el mensaje con más de 5 minutos de envío.')
      }
      const data = { ...mensagem }
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea eliminar el mensaje?',
        message: 'Los mensajes antiguos no se eliminarán en el cliente.',
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
      }).onOk(() => {
        this.loading = true
        DeletarMensagem(data)
          .then((res) => {
            this.loading = false
            mensagem.isDeleted = true
          })
          .catch(error => {
            this.loading = false
            console.error(error)
            this.$notificarErro('No se pudo eliminar el mensaje', error)
          })
      }).onCancel(() => {
      })
    },
    focarMensagem (mensagem) {
      const id = `chat-message-${mensagem.id}`
      this.identificarMensagem = id
      this.$nextTick(() => {
        const elem = document.getElementById(id)
        elem.scrollIntoView()
      })
      setTimeout(() => {
        this.identificarMensagem = null
      }, 5000)
    }
  },
  mounted () {
    this.scrollToBottom()
  },
  destroyed () {
  }
}
</script>

<style lang="scss">
.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.reaction-container {
  font-size: 0.75rem;
  color: #606060;
  margin-top: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: #f0f0f0;
  display: inline-block;
}
</style>
