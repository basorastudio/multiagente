<template>
  <div>
    <q-card
      flat
      class="q-pa-sm q-pb-md"
    >
      <q-card-section class="q-pa-none">
        <div class="flex flex-inline full-width items-center">
          <div
            class="flex flex-inline text-left"
            style="width: 40px"
          >
            <q-btn
              round
              flat
              dense
            >
              <q-icon
                size="2em"
                name="mdi-emoticon-happy-outline"
              />
              <q-tooltip>
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
                  labelSearch="Localizar..."
                  lang="es"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
            <q-btn
              round
              flat
              dense
            >
              <q-icon
                size="2em"
                name="mdi-variable"
              />
              <q-tooltip>
                Variables
              </q-tooltip>
              <q-menu touch-position>
                <q-list
                  dense
                  style="min-width: 100px"
                >
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.label"
                    clickable
                    @click="onInsertSelectVariable(variavel.value)"
                    v-close-popup
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <textarea
            ref="inputEnvioMensagem"
            style="min-height: 10vh; max-height: 30vh; flex: auto"
            class="q-pa-sm bg-white rounded-all"
            placeholder="Escriba el mensaje"
            autogrow
            dense
            outlined
            @input="(v) => $attrs.element.data.message = v.target.value"
            :value="$attrs.element.data.message"
          >
          </textarea>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  name: 'MessageField',
  components: { VEmojiPicker },
  data () {
    return {
      variaveis: [
        { label: 'Nombre', value: '{{name}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' }
      ]
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener la posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtrar:
      if (!emoji.data) {
        return
      }
      // insertar:
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // mover el cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectVariable (variable) {
      console.log('onInsertSelectVariable', variable)
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener la posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtrar:
      if (!variable) {
        return
      }
      // insertar:
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // mover el cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
