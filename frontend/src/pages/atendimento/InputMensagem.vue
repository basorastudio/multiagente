<template>
  <div>
    <template v-if="ticketFocado.status != 'pending'">

      <div
        class="row absolute-full fit col-12"
        ref="menuFast"
      >
        <q-menu
          :target="$refs.menuFast"
          :key="cMensagensRapidas.length"
          square
          no-focus
          no-parent-event
          class="no-box-shadow no-shadow"
          fit
          :offset="[0, 5]"
          persistent
          max-height="400px"
          @hide="visualizarMensagensRapidas = false"
          :value="textChat.startsWith('/') || visualizarMensagensRapidas"
        >
          <!-- :value="textChat.startsWith('/')" -->
          <q-list
            class="no-shadow no-box-shadow"
            style="min-width: 100px"
            separator
            v-if="!cMensagensRapidas.length"
          >
            <q-item>
              <q-item-section>
                <q-item-label class="text-negative text-bold">¡Ups... Nada por aquí!</q-item-label>
                <q-item-label caption>Registre sus mensajes en la administración del sistema.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-list
            class="no-shadow no-box-shadow"
            style="min-width: 100px"
            separator
            v-else
          >
            <q-item
              v-for="resposta in cMensagensRapidas"
              :key="resposta.key"
              clickable
              v-close-popup
              @click="mensagemRapidaSelecionada(resposta.message)"
            >
              <q-item-section>
                <q-item-label class="text-bold"> {{ resposta.key }} </q-item-label>
                <q-item-label
                  caption
                  lines="2"
                > {{ resposta.message }} </q-item-label>
              </q-item-section>
              <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
                {{ resposta.message }}
              </q-tooltip>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <div
        style="min-height: 80px"
        class="row q-pb-md q-pt-sm bg-white justify-start items-center text-grey-9 relative-position"
      >

        <div
          class="row col-12 q-pa-sm"
          v-if="isScheduleDate"
        >
          <q-datetime-picker
            style="width: 300px"
            dense
            rounded
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Fecha/Hora Programación"
            mode="datetime"
            color="primary"
            v-model="scheduleDate"
            format24h
            :timezone="localTimeZone"
          />
        </div>

        <template v-if="!isRecordingAudio">
          <q-btn
            v-if="$q.screen.width > 500 && ticketFocado.channel !== 'hub_facebook'"
            flat
            dense
            @click="abrirEnvioArquivo"
            icon="mdi-paperclip"
            :disable="cDisableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">
              Enviar archivo
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            icon="mdi-emoticon-happy-outline"
            :disable="cDisableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">
              Emoji
            </q-tooltip>
            <q-menu
              anchor="top right"
              self="bottom middle"
              :offset="[5, 40]"
            >
              <VEmojiPicker
                style="width: 40vw"
                :showSearch="false"
                :emojisByRow="20"
                labelSearch="Buscar..."
                lang="es"
                @select="onInsertSelectEmoji"
              />
            </q-menu>
          </q-btn>
          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            @click="handlSendLinkVideo"
            icon="mdi-message-video"
            :disable="cDisableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">
              Enviar enlace para videoconferencia
            </q-tooltip>
          </q-btn>
          <q-toggle
            keep-color
            v-model="sign"
            dense
            @input="handleSign"
            class="q-mx-sm q-ml-md"
            :color="sign ? 'positive' : 'black'"
            type="toggle"
          >
            <q-tooltip>
              {{ sign ? 'Desactivar' : 'Activar' }} Firma
            </q-tooltip>
          </q-toggle>
          <q-input
            hide-bottom-space
            :loading="loading"
            :disable="cDisableActions"
            ref="inputEnvioMensagem"
            id="inputEnvioMensagem"
            type="textarea"
            @keydown.exact.enter.prevent="() => textChat.trim().length ? enviarMensagem() : ''"
            v-show="!cMostrarEnvioArquivo"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
            bg-color="grey-2"
            color="grey-7"
            placeholder="Escribe tu mensaje"
            input-style="max-height: 30vh"
            autogrow
            rounded
            dense
            outlined
            v-model="textChat"
            :value="textChat"
            @paste="handleInputPaste"
          >
            <!-- <template v-slot:hint>
          "Salto de línea: Shift + Enter"
        </template> -->
            <template
              v-slot:prepend
              v-if="$q.screen.width < 500"
            >
              <q-btn
                flat
                icon="mdi-emoticon-happy-outline"
                :disable="cDisableActions"
                dense
                round
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class="text-bold">
                  Emoji
                </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <VEmojiPicker
                    style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    labelSearch="Buscar..."
                    lang="es"
                    @select="onInsertSelectEmoji"
                  />
                </q-menu>
              </q-btn>
            </template>
            <template v-slot:append>
              <q-btn
                flat
                @click="abrirEnvioArquivo"
                icon="mdi-paperclip"
                :disable="cDisableActions"
                dense
                round
                v-if="$q.screen.width < 500 && ticketFocado.channel !== 'hub_facebook'"
                class="bg-padrao btn-rounded"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class=" text-bold">
                  Enviar archivo
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                flat
                round
                icon="mdi-message-flash-outline"
                @click="visualizarMensagensRapidas = !visualizarMensagensRapidas"
              >
                <q-tooltip content-class="text-bold">
                  Mensajes Rápidos
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <!-- tamaño máximo por archivo de 10mb -->
          <q-file
            :loading="loading"
            :disable="cDisableActions"
            ref="PickerFileMessage"
            id="PickerFileMessage"
            v-show="cMostrarEnvioArquivo"
            v-model="arquivos"
            class="col-grow q-mx-xs PickerFileMessage"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            use-chips
            multiple
            autogrow
            dense
            rounded
            append
            :max-files="5"
            :max-file-size="ticketFocado.channel === 'hub_instagram' ? 8388608 : 15485760"
            :max-total-size="ticketFocado.channel === 'hub_instagram' ? 8388608 : 15485760"
            :accept="ticketFocado.channel === 'hub_instagram' ? '.jpeg, .png, .ico, .bmp, .webp, .*': '.txt, .xml, .jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .ogg, .mp3, .xls, .xlsx, .jpeg, .rar, .zip, .ppt, .pptx, image/*'"
            @rejected="onRejectedFiles"
          />
          <q-btn
            v-if="textChat || cMostrarEnvioArquivo"
            ref="btnEnviarMensagem"
            @click="enviarMensagem"
            :disabled="ticketFocado.status !== 'open'"
            flat
            icon="mdi-send"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class=" text-bold">
              Enviar Mensaje
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio"
            @click="handleSartRecordingAudio"
            :disabled="cDisableActions"
            flat
            icon="mdi-microphone"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold">
              Enviar Audio
            </q-tooltip>
          </q-btn>
        </template>
        <template v-else>
          <div class="full-width items-center row justify-end ">
            <q-skeleton
              animation="pulse-y"
              class="col-grow q-mx-md"
              type="text"
            />
            <div
              style="width: 200px"
              class="flex flex-center items-center"
              v-if="isRecordingAudio"
            >
              <q-btn
                flat
                icon="mdi-close"
                color="negative"
                @click="handleCancelRecordingAudio"
                class="bg-padrao btn-rounded q-mx-xs"
              />
              <RecordingTimer
                class="text-bold"
                :class="{ 'text-white': $q.dark.isActive }"
              />
              <q-btn
                flat
                icon="mdi-send-circle-outline"
                color="positive"
                @click="handleStopRecordingAudio"
                class="bg-padrao btn-rounded q-mx-xs"
              />
            </div>

          </div>
        </template>

        <q-dialog
          v-model="abrirModalPreviewImagem"
          position="right"
          @hide="hideModalPreviewImagem"
          @show="showModalPreviewImagem"
        >
          <q-card
            style="height: 90vh; min-width: 60vw; max-width: 60vw"
            class="q-pa-md"
          >
            <q-card-section>
              <div class="text-h6">{{ urlMediaPreview.title }}
                <q-btn
                  class="float-right"
                  icon="close"
                  color="negative"
                  round
                  outline
                  @click="hideModalPreviewImagem"
                />
              </div>
            </q-card-section>
            <q-card-section>
              <q-img
                :src="urlMediaPreview.src"
                spinner-color="white"
                class="img-responsive mdi-image-auto-adjust q-uploader__file--img"
                style="height: 60vh; min-width: 55vw; max-width: 55vw"
              />
            </q-card-section>
            <q-card-actions align="center">
              <q-btn
                ref="qbtnPasteEnvioMensagem"
                label="Enviar"
                color="primary"
                v-close-popup
                @click="enviarMensagem"
                @keypress.enter.exact="enviarMensagem()"
              />
            </q-card-actions>
            <span class="row col text-caption text-blue-grey-10">* Confirmar envío: Enter</span>
            <span class="row col text-caption text-blue-grey-10">** Cancelar: ESC</span>
          </q-card>
        </q-dialog>
      </div>
    </template>
    <template v-else>
      <div
        style="min-height: 80px"
        class="row q-pb-md q-pt-sm bg-white justify-center items-center text-grey-9 relative-position"
      >
        <q-btn
          push
          rounded
          style="width: 250px"
          class="text-bold"
          color="positive"
          icon="mdi-send-circle"
          label="Iniciar la atención"
          @click="iniciarAtendimento(ticketFocado)"
        />

      </div>
    </template>
    <!-- <p
      v-if="!cMostrarEnvioArquivo"
      class="row col text-caption text-blue-grey-10"
    >Salto de línea/Párrafo: Shift + Enter ||| Enviar Mensaje: Enter</p> -->
  </div>
</template>

<script>
import { LocalStorage, uid } from 'quasar'
import mixinCommon from './mixinCommon'
import { EnviarMensagemTexto } from 'src/service/tickets'
import { EnviarMensagemHub } from 'src/service/hub'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'
import RecordingTimer from './RecordingTimer'
import MicRecorder from 'mic-recorder-to-mp3'
const Mp3Recorder = new MicRecorder({
  bitRate: 128,
  encodeAfterRecord: true
})
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'

export default {
  name: 'InputMensagem',
  mixins: [mixinAtualizarStatusTicket, mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null
    },
    isScheduleDate: {
      type: Boolean,
      default: false
    },
    mensagensRapidas: {
      type: Array,
      default: () => []
    }
  },
  components: {
    VEmojiPicker,
    RecordingTimer
  },
  data () {
    return {
      loading: false,
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
      urlMediaPreview: {
        title: '',
        src: ''
      },
      visualizarMensagensRapidas: false,
      arquivos: [],
      textChat: '',
      sign: false,
      scheduleDate: null,
      localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo'
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo () {
      return this.arquivos.length > 0
    },
    cDisableActions () {
      return (this.isRecordingAudio || this.ticketFocado.status !== 'open')
    },
    cMensagensRapidas () {
      let search = this.textChat?.toLowerCase()
      if (search && search.trim().startsWith('/')) {
        search = search.replace('/', '')
      }
      return !search ? this.mensagensRapidas : this.mensagensRapidas.filter(r => r.key.toLowerCase().indexOf(search) !== -1)
      // return this.mensagensRapidas
    }
  },
  methods: {
    openFilePreview (event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputPaste (e) {
      if (!this.ticketFocado?.id) return
      if (e.clipboardData.files[0]) {
        this.textChat = ''
        this.arquivos = [e.clipboardData.files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: `Enviar imagen a ${this.ticketFocado?.contact?.name}`,
          src: this.openFilePreview(e)
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    mensagemRapidaSelecionada (mensagem) {
      this.textChat = mensagem
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
    },
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem.$refs.input
      // get cursor's position:
      // obtener la posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value

      // filter:
      // filtro:
      if (!emoji.data) {
        return
      }

      // insert:
      // insertar:
      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent
      // move cursor:
      // mover cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    abrirEnvioArquivo (event) {
      this.textChat = ''
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleSartRecordingAudio () {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        await Mp3Recorder.start()
        this.isRecordingAudio = true
      } catch (error) {
        this.isRecordingAudio = false
      }
    },
    async handleStopRecordingAudio () {
      const ticketId = this.ticketFocado.id
      this.loading = true
      try {
        const [, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('fromMe', true)
        formData.append('id', uid())
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        // await EnviarMensagemTexto(ticketId, formData)
        if (this.ticketFocado.channel.includes('hub')) {
          await EnviarMensagemHub(ticketId, formData)
        } else {
          await EnviarMensagemTexto(ticketId, formData)
        }
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        this.loading = false
        this.$notificarErro('¡Ocurrió un error!', error)
      }
    },
    async handleCancelRecordingAudio () {
      try {
        await Mp3Recorder.stop().getMp3()
        this.isRecordingAudio = false
        this.loading = false
      } catch (error) {
        this.$notificarErro('¡Ocurrió un error!', error)
      }
    },
    prepararUploadMedia () {
      if (!this.arquivos.length) {
        throw new Error('No existen archivos para envío')
      }
      const formData = new FormData()
      formData.append('fromMe', true)
      formData.append('id', uid())
      this.arquivos.forEach(media => {
        formData.append('medias', media)
        formData.append('body', media.name)
        // formData.append('idFront', uid())
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
      })
      return formData
    },
    prepararMensagemTexto () {
      if (this.textChat.trim() === '') {
        throw new Error('Mensaje Inexistente')
      }

      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find(m => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error = this.cMensagensRapidas.length > 1
            ? 'Varios mensajes rápidos encontrados. Seleccione uno o escriba una clave única del mensaje.'
            : '/ indica que desea enviar un mensaje rápido, pero no se encontró ninguno. Registre o elimine / y escriba su mensaje.'
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:
 ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        // idFront: uid()
        id: uid()
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    async enviarMensagem () {
      if (this.isScheduleDate && !this.scheduleDate) {
        this.$notificarErro('Para programar un mensaje, informe el campo Fecha/Hora Programación.')
        return
      }
      this.loading = true
      const ticketId = this.ticketFocado.id
      const message = !this.cMostrarEnvioArquivo
        ? this.prepararMensagemTexto()
        : this.prepararUploadMedia()
      try {
        if (!this.cMostrarEnvioArquivo && !this.textChat) return
        // await EnviarMensagemTexto(ticketId, message)
        if (this.ticketFocado.channel.includes('hub')) {
          await EnviarMensagemHub(ticketId, message)
        } else {
          await EnviarMensagemTexto(ticketId, message)
        }
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        this.loading = false
        this.$notificarErro('¡Ocurrió un error!', error)
      }
      this.isRecordingAudio = false
      this.loading = false
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
    },
    async handlSendLinkVideo () {
      const link = `https://meet.jit.si/${uid()}/${uid()}`
      let mensagem = link
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:
 ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        // idFront: uid()
        id: uid()
      }

      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        // await EnviarMensagemTexto(ticketId, message)
        if (this.ticketFocado.channel.includes('hub')) {
          await EnviarMensagemHub(ticketId, message)
        } else {
          await EnviarMensagemTexto(ticketId, message)
        }
        setTimeout(() => {
          this.scrollToBottom()
        }, 200)
        setTimeout(() => {
          window.open(link, '_blank')
        }, 800)
      } catch (error) {
        this.loading = false
        this.$notificarErro('¡Ocurrió un error!', error)
      }
      this.loading = false
    },
    handlerInputMensagem (v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem () {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem () {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    },
    onRejectedFiles (rejectedEntries) {
      let message

      if (this.ticketFocado.channel === 'hub_instagram') {
        message = `¡Ups... Ocurrió un error! <br>
    <ul>
    <li>Cada archivo debe tener como máximo 8MB.</li>
    <li>Solo se aceptan archivos en formatos .jpeg, .png, .ico, .bmp, .webp y .*</li>
    </ul>`
      } else {
        message = `¡Ups... Ocurrió un error! <br>
    <ul>
    <li>Cada archivo debe tener como máximo 10MB.</li>
    <li>En caso de múltiples archivos, el tamaño total (suma de todos) debe ser de hasta 30MB.</li>
    </ul>`
      }
      this.$q.notify({
        html: true,
        message: message,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    },
    handleSign (state) {
      this.sign = state
      LocalStorage.set('sign', this.sign)
    }
  },
  mounted () {
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
    const self = this
    window.addEventListener('paste', self.handleInputPaste)
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      this.handleSign(LocalStorage.getItem('sign'))
    }
  },
  beforeDestroy () {
    const self = this
    window.removeEventListener('paste', self.handleInputPaste)
  },
  destroyed () {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  }
}
</script>

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important
</style>
