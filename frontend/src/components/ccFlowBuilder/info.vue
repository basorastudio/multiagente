<template>
  <q-dialog
    title="Información de datos del flujo"
    v-model="dialogVisible"
    width="70%"
  >
    <el-alert
      title="Instrucciones de uso"
      type="warning"
      description="La siguiente información del flujo puede ser almacenada para facilitar la carga del flujo la próxima vez."
      show-icon
      close-text="Entendido"
    >
    </el-alert>
    <br />
    <!--Un complemento de visualización destacada-->
    <codemirror
      :value="flowJsonData"
      :options="options"
      class="code"
    ></codemirror>
  </q-dialog>
</template>

<script>
import 'codemirror/lib/codemirror.css'
import { codemirror } from 'vue-codemirror'

require('codemirror/mode/javascript/javascript.js')

export default {
  props: {
    data: Object
  },
  data () {
    return {
      dialogVisible: false,
      flowJsonData: {},
      options: {
        mode: { name: 'javascript', json: true },
        lineNumbers: true
      }
    }
  },
  components: {
    codemirror
  },
  methods: {
    init () {
      this.dialogVisible = true
      this.flowJsonData = JSON.stringify(this.data, null, 4).toString()
    }
  }
}
</script>
