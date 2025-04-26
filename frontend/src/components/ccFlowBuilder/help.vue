<template>
  <q-dialog
    title="Ayuda"
    v-model="dialogVisible"
    width="70%"
    customClass="flowHelp"
  >
    <el-tabs tab-position="left">
      <el-tab-pane label="Cómo agregar">
        <el-divider content-position="left">Cómo agregar</el-divider>
        <div>Mantén presionado el ratón y arrastra el componente de la izquierda al lienzo central, luego suelta el ratón.</div>
      </el-tab-pane>
      <el-tab-pane label="Cómo eliminar">
        <el-divider content-position="left">Eliminar de la página</el-divider>
        <div>
          Haz clic con el ratón en el nodo que deseas eliminar y luego haz clic en el icono de eliminar en la esquina superior izquierda.
        </div>
        <el-divider content-position="left">Eliminar mediante código</el-divider>
        <pre>this.deleteNode(nodeId)</pre>
      </el-tab-pane>
      <el-tab-pane label="Cómo mover">
        <el-divider content-position="left">Cómo mover</el-divider>
        <div>Mueve el ratón sobre el nodo. Cuando el cursor cambie a un icono de arrastre, haz clic y mantén presionado el ratón mientras lo mueves a la nueva posición, luego suelta el ratón.</div>
      </el-tab-pane>
      <el-tab-pane label="Cómo conectar">
        <el-divider content-position="left">Cómo conectar</el-divider>
        <div>Mueve el ratón sobre el icono en el lado izquierdo del nodo. Cuando el cursor cambie a un signo +, haz clic y mantén presionado el ratón mientras lo mueves a otro nodo, luego suelta el ratón.</div>
      </el-tab-pane>
      <el-tab-pane label="Cómo agregar condiciones">
        <el-divider content-position="left">Cómo agregar condiciones</el-divider>
        <div>Haz clic en la línea de conexión en el lienzo. Aparecerá un formulario en el lado derecho de la página. Ingresa la nueva condición y haz clic en [Guardar].</div>
      </el-tab-pane>
      <el-tab-pane label="Cómo realizar almacenamiento interactivo en el backend">
        <el-divider content-position="left">Cómo realizar almacenamiento interactivo en el backend</el-divider>
        <div>Referencia: https://gitee.com/xiaoka2017/easy-flow-sdk</div>
      </el-tab-pane>
    </el-tabs>
  </q-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialogVisible: false
    }
  },
  components: {},
  methods: {
    init () {
      this.dialogVisible = true
    }
  }
}
</script>

<style>
.flowHelp {
  height: 80%;
}
</style>
