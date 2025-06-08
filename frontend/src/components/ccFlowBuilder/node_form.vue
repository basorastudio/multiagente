<template>
  <div class="q-px-md q-py-sm">
    <div class="row justify-between col q-mb-sm">
      <q-btn
        rounded
        color="primary"
        icon="mdi-plus"
        label="Nueva Etapa"
        @click="addNode"
      />
      <q-btn
        rounded
        color="positive"
        icon="mdi-content-save-outline"
        label="Guardar"
        @click="$emit('saveFlow')"
      />
    </div>
    <q-card
      bordered
      flat
      class="fit"
    >
      <div class="ef-node-form-header">
        Configuración Flujo
      </div>
      <div class="q-pa-sm">
        <q-input
          outlined
          rounded
          label="Nombre"
          v-model="node.name"
          class="q-my-sm"
          :disable="['start', 'configurations'].includes(node.type)"
        />
        <q-separator inset="" />
      </div>
      <q-card-section
        class="q-pa-sm"
        v-if="node.type === 'node'"
      >
        <div>
          <q-tabs
            v-model="tabNodeForm"
            narrow-indicator
            class="text-grey-8 bg-grey-3 rounded-all"
          >
            <q-tab
              name="interacoes"
              label="Interacciones"
            />
            <q-tab
              name="condicoes"
              label="Condiciones"
            />

          </q-tabs>
          <q-tab-panels
            v-model="tabNodeForm"
            animated
            keep-alive
            infinite
            class="q-pa-none rounded-borders"
          >
            <q-tab-panel
              class="q-pa-none"
              name="interacoes"
            >
              <div class="text-center ">
                <div class="row q-mt-sm col justify-center">
                  <q-btn
                    flat
                    icon="mdi-message-text-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addMessage"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar Mensaje
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="addMediaField"
                    flat
                    icon="mdi-file-document-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar documentos, video, audio y otros archivos.
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="row bg-grey-3 q-pa-sm q-my-md justify-center scroll"
                  style="height: calc(100vh - 495px)"
                >
                  <div class="col-xs-12">
                    <div
                      v-for="(element, idx) in node.interactions"
                      :key="element.id"
                      v-bind="element"
                    >
                      <div class="q-my-md">
                        <div class="bg-white rounded-all full-width row col justify-between ">
                          <q-btn
                            round
                            dense
                            disable
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            :label="idx + 1"
                            style="z-index: 999; "
                          />
                          <q-space />
                          <q-btn
                            round
                            dense
                            icon="mdi-arrow-up-bold"
                            flat
                            color="positive"
                            class="bg-padrao q-mr-md"
                            style="z-index: 999"
                            :disable="idx === 0"
                            @click="changePosition(node.interactions, idx, idx - 1)"
                          >
                            <q-tooltip>
                              Reordenar
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            dense
                            icon="mdi-arrow-down-bold"
                            flat
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            class="bg-padrao q-mr-md"
                            style="z-index: 999"
                            @click="changePosition(node.interactions, idx, idx + 1)"
                          >
                            <q-tooltip>
                              Reordenar
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            dense
                            icon="mdi-close"
                            flat
                            color="negative"
                            class="bg-padrao"
                            style="z-index: 999;"
                            @click="removeItem(element, idx + 1)"
                          />
                        </div>
                        <component
                          :is="element.type"
                          :element="element"
                        >
                        </component>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel
              class="q-pa-none"
              name="condicoes"
            >
              <div v-show="type === 'node'">
                <div class="row q-mt-md col justify-end">
                  <q-btn
                    flat
                    icon="mdi-vector-polyline-plus"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addCondiction"
                    label="Nueva"
                    rounded
                  >
                    <q-tooltip content-class="text-bold">
                      Nueva condición
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  style="height: calc(100vh - 490px)"
                  class="row bg-grey-3 q-pa-sm scroll q-mt-md col justify-start"
                >
                  <template v-for="(condition, idx) in node.conditions">
                    <q-card
                      bordered
                      flat
                      :key="condition.id"
                      class="full-width q-my-sm"
                      style="min-height: 250px;"
                    >
                      <div class="full-width row col justify-between text-left q-pa-xs">
                        <q-btn
                          round
                          dense
                          disable
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          :label="idx + 1"
                        />
                        <q-space />
                        <q-btn
                          round
                          dense
                          icon="mdi-arrow-up-bold"
                          flat
                          color="positive"
                          class="bg-padrao q-mr-md"
                          style="z-index: 999"
                          :disable="idx === 0"
                          @click="changePosition(node.conditions, idx, idx - 1)"
                        >
                          <q-tooltip>
                            Reordenar: Aumentar prioridad de la regla de condición
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          round
                          dense
                          icon="mdi-arrow-down-bold"
                          flat
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          class="bg-padrao q-mr-md"
                          style="z-index: 999"
                          @click="changePosition(node.conditions, idx, idx + 1)"
                        >
                          <q-tooltip>
                            Reordenar: Disminuir prioridad de la regla de condición
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          round
                          dense
                          icon="mdi-close"
                          flat
                          color="negative"
                          class="bg-padrao"
                          style="z-index: 999"
                          @click="removeConditionItem(condition, idx)"
                        />
                      </div>
                      <q-card-section class="q-pa-sm q-gutter-sm">
                        <q-select
                          outlined
                          dense
                          rounded
                          v-model="condition.type"
                          :options="optionsSe"
                          label="Si"
                          map-options
                          emit-value
                        />
                        <q-select
                          v-if="condition.type === 'R'"
                          dense
                          rounded
                          label="Respuestas"
                          outlined
                          v-model="condition.condition"
                          use-input
                          use-chips
                          multiple
                          hide-dropdown-icon
                          input-debounce="0"
                          new-value-mode="add-unique"
                          hint="Digite el valor y presione enter"
                        />
                      </q-card-section>
                      <q-separator
                        inset
                        spaced
                      />
                      <q-card-section class="q-pa-sm">
                        <div class="text-bold q-px-sm"> Enrutar a: </div>
                        <q-option-group
                          class="text-center"
                          inline
                          v-model="condition.action"
                          :options="optionsAcao"
                          color="primary"
                        />
                        <div class="row q-mt-sm">
                          <div class="col">
                            <q-select
                              v-if="condition.action === 0"
                              dense
                              rounded
                              outlined
                              class="full-width"
                              :value="condition.nextStepId || ''"
                              :options="nodesList.nodeList.filter(n => n.type !== 'configurations')"
                              option-label="name"
                              option-value="id"
                              label="Etapa"
                              map-options
                              emit-value
                              clearable
                              @input="nextStepId => addLineStep(nextStepId, idx)"
                            />
                            <q-select
                              v-if="condition.action === 1"
                              dense
                              outlined
                              rounded
                              class="full-width"
                              v-model="condition.queueId"
                              :options="filas"
                              option-label="queue"
                              option-value="id"
                              label="Cola"
                              :key="condition.queueId"
                              map-options
                              emit-value
                              clearable
                              @input="condition.nextStepId = null; condition.userIdDestination = null"
                            />
                            <q-select
                              v-if="condition.action === 2"
                              dense
                              outlined
                              rounded
                              class="full-width"
                              v-model="condition.userIdDestination"
                              :options="usuarios"
                              option-label="name"
                              option-value="id"
                              label="Usuario"
                              map-options
                              emit-value
                              clearable
                              @input="condition.nextStepId = null; condition.queueId = null"
                            />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </template>

                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <div
            class="q-pa-sm q-gutter-md"
            v-show="type === 'line'"
          >
            <q-input
              outlined
              label="Clave"
              v-model="line.label"
            />
            <q-btn
              icon="mdi-close"
              label="Redefinir"
            />
            <q-btn
              type="primary"
              icon="mdi-content-save"
              @click="saveLine"
              label="Guardar"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section
        style="height: calc(100vh - 380px)"
        class="row bg-grey-3 q-pa-sm scroll col justify-start"
        v-if="node.type === 'configurations'"
      >
        <q-card
          class="full-width q-my-sm"
          style="height: 280px;"
        >
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Mensaje de saludo (Cola/Usuario)
            <div class="row text-subtitle2">
              Cuando el bot dirija la atención a una cola o usuario,
              este mensaje será enviado.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label
                  class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"
                > Mensaje: </label>
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
                          labelSearch="Buscar..."
                          lang="es"
                          @select="onInsertSelectEmojiSaudacao"
                        />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea
                    ref="inputEnvioMensagemSaudacao"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white rounded-all"
                    placeholder="Digite el mensaje"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.welcomeMessage.message = v.target.value"
                    :value="node.configurations.welcomeMessage.message"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 300px;"
        >
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Si no se envía ninguna respuesta esperada
            <div class="row text-subtitle2">
              Esta excepción se aplicará si la respuesta enviada por el cliente no corresponde
              a los valores esperados según las condiciones de la etapa.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label
                  class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"
                > Mensaje de retroalimentación: </label>
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
                          labelSearch="Buscar..."
                          lang="es"
                          @select="onInsertSelectEmojiNotOptionsSelectMessage"
                        />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea
                    ref="inputEnvioMensagemnotOptionsSelectMessage"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white rounded-all"
                    placeholder="Digite el mensaje"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.notOptionsSelectMessage.message = v.target.value"
                    :value="node.configurations.notOptionsSelectMessage.message"
                  />
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 290px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Ausencia de respuesta
            <div class="row text-subtitle2">
              Después del tiempo determinado, si el cliente no responde,
              el bot realizará el enrutamiento a la Cola/Usuario informados.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input
                  dense
                  outlined
                  mask="###"
                  rounded
                  v-model.number="node.configurations.notResponseMessage.time"
                  label="Tiempo (minutos)"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.notResponseMessage.type"
                  :options="[
                    { value: 1, label: 'Cola' },
                    { value: 2, label: 'Usuario' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  v-if="node.configurations.notResponseMessage.type === 1"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  label="Cola"
                  map-options
                  emit-value
                  clearable
                />
                <q-select
                  v-if="node.configurations.notResponseMessage.type === 2"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  label="Usuario"
                  map-options
                  emit-value
                  clearable
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Máximo de Intentos del Bot
            <div class="row text-subtitle2">
              Una vez excedido el número máximo de reintentos de pregunta/respuesta,
              si el cliente no envía una respuesta válida, el bot realizará el enrutamiento
              a la Cola/Usuario configurados.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input
                  dense
                  rounded
                  outlined
                  mask="##"
                  v-model.number="node.configurations.maxRetryBotMessage.number"
                  label="Número de intentos"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.maxRetryBotMessage.type"
                  :options="[
                    { value: 1, label: 'Cola' },
                    { value: 2, label: 'Usuario' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  v-if="node.configurations.maxRetryBotMessage.type === 1"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  label="Cola"
                  map-options
                  emit-value
                  clearable
                />
                <q-select
                  v-if="node.configurations.maxRetryBotMessage.type === 2"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  label="Usuario"
                  map-options
                  emit-value
                  clearable
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Auto Distribuir Atención
            <div class="row text-subtitle2">
              No: Desactivado. <br />
              Balancear: Definirá el usuario con base en la cantidad de atenciones de cada usuario de la cola. Usuario con
              menos atenciones será elegido.<br />
              Aleatoria: Definirá el usuario de forma aleatoria/randómica para los usuarios de la cola.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.autoDistributeTickets"
                  :options="[
                    { value: 'N', label: 'No' },
                    { value: 'R', label: 'Aleatoria' },
                    { value: 'B', label: 'Balanceada' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Cerrar Atención
            <div class="row text-subtitle2">
              Si el cliente digita alguna de las informaciones esperadas, la atención será cerrada.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  dense
                  label="Parámetros"
                  outlined
                  rounded
                  v-model="node.configurations.answerCloseTicket"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  hint="Digite el valor y presione enter"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

      </q-card-section>

      <q-card-section
        style="height: calc(100vh - 380px)"
        class="row bg-grey-3 q-pa-sm scroll col justify-start"
        v-if="node.type === 'start'"
      >
        <q-card class="full-width q-my-sm">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Etapa representa el contacto inicial.
            <div class="row text-subtitle2">
              - Si es el primer contacto del cliente, el sistema
              guardará automáticamente en la agenda la información del cliente.
            </div>
            <div class="row text-subtitle2">
              - El Bot interactuará en las atenciones iniciadas por los clientes.
            </div>
            <div class="row text-subtitle2">
              - El Bot dejará de interactuar si la atención es asumida por un usuario.
            </div>
          </div>
        </q-card>
      </q-card-section>

    </q-card>
  </div>
</template>

<script>
import { uid } from 'quasar'
import MessageField from './messageField'
import MediaField from './mediaField.vue'
import { VEmojiPicker } from 'v-emoji-picker'
export default {
  components: {
    MessageField,
    VEmojiPicker,
    MediaField
  },
  props: {
    nodesList: {
      type: Object,
      default: () => { }
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      visible: true,
      tabNodeForm: 'interacoes',
      elements: [],
      optionsAcao: [
        { value: 0, label: 'Etapa' },
        { value: 1, label: 'Cola' },
        { value: 2, label: 'Usuario' }
      ],
      optionsSe: [
        { label: 'Cualquier respuesta', value: 'US' },
        { label: 'Respuestas', value: 'R' }
      ],
      type: 'node',
      node: {},
      line: {},
      data: {},
      stateList: [{
        state: 'success',
        label: 'Éxito'
      }, {
        state: 'warning',
        label: 'Advertencia'
      }, {
        state: 'error',
        label: 'Error'
      }, {
        state: 'running',
        label: 'En ejecución'
      }]
    }
  },
  methods: {
    gerarUID () {
      return uid()
    },
    addMessage () {
      this.node.interactions.push({
        type: 'MessageField',
        data: { message: '' },
        id: this.gerarUID()
      })
    },
    addMediaField () {
      this.node.interactions.push({
        type: 'MediaField',
        data: {
          ext: '',
          mediaUrl: '',
          media: '',
          type: '',
          name: '',
          caption: ''
        },
        id: this.gerarUID()
      })
    },
    addCondiction () {
      this.node.conditions.push({
        type: '',
        condition: [],
        id: this.gerarUID()
      })
    },
    changePosition (arr, from, to) {
      arr.splice(to, 0, arr.splice(from, 1)[0])
      return arr
    },
    addNode () {
      const nodeMenu = {
        id: this.gerarUID(),
        nodeId: this.gerarUID(),
        name: 'Nueva etapa',
        type: 'node',
        left: '100px',
        top: '40px',
        interactions: [],
        conditions: [],
        actions: []
      }
      const evt = {
        originalEvent: {
          clientX: '100px',
          clientY: '10px'
        }
      }

      this.$emit('addNode', evt, nodeMenu, null)
    },
    removeConditionItem (condition, idx) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Realmente desea eliminar la condición (${idx + 1})?`,
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
        const nConditions = this.node.conditions.filter(c => c.id !== condition.id)
        this.node.conditions = nConditions
      })
    },
    onInsertSelectEmojiSaudacao (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemSaudacao
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      if (!emoji.data) {
        return
      }
      self.txtContent = this.node.configurations.welcomeMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.welcomeMessage.message = self.txtContent
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiNotOptionsSelectMessage (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemnotOptionsSelectMessage
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      if (!emoji.data) {
        return
      }
      self.txtContent = this.node.configurations.notOptionsSelectMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.notOptionsSelectMessage.message = self.txtContent
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    addLineStep (nextStepId, idx) {
      if (this.node.conditions[idx]?.queueId) {
        this.node.conditions[idx].queueId = null
      }
      if (this.node.conditions[idx]?.userIdDestination) {
        this.node.conditions[idx].userIdDestination = null
      }
      const oldToLine = this.node.conditions[idx].nextStepId
      this.node.conditions[idx].nextStepId = nextStepId
      if (oldToLine != nextStepId) {
        this.$emit('addNewLineCondition', this.node.id, nextStepId, oldToLine)
      }
    },
    removeItem (el, idx) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Realmente desea eliminar el elemento (${idx})?`,
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
        const idx = this.node.interactions.findIndex(e => e.id === el.id)
        this.node.interactions.splice(idx, 1)
      })
    },
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          this.node = node
        }
      })
    },
    lineInit (line) {
      this.type = 'line'
      this.line = line
    },
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.state = this.node.state
          node.state = this.node.actions
          node.state = this.node.conditions
          node.state = this.node.interactions
          this.$emit('repaintEverything')
        }
      })
    }
  },
  mounted () {
    console.log('node_form montado', this.node)
  }
}
</script>

<style>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}
</style>
