<template>
  <q-dialog :value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent>
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          Lea el Código QR para iniciar la sesión
          <q-btn round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal" />
        </div>
      </q-card-section>
      <q-card-section class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <QrcodeVue v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H" />
        <span v-else>
          Esperando el Código QR
        </span>
      </q-card-section>
      <q-card-section>
        <div class="row">Si tiene problemas con la lectura, solicite un nuevo Código QR </div>
        <div class="row col-12 justify-center">
          <q-btn color="primary"
            glossy
            ripple
            outline
            label="Nuevo Código QR"
            @click="solicitarQrCode"
            icon="watch_later" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>

import QrcodeVue from 'qrcode.vue'

export default {
  name: 'ModalQrCode',
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => ({
        id: null,
        qrcode: ''
      })
    }
  },
  watch: {
    channel: {
      handler (v) {
        if (this.channel.status === 'CONNECTED') {
          this.fecharModalQrModal()
        }
      },
      deep: true
    }
  },
  computed: {
    cQrcode () {
      return this.channel.qrcode
    }
  },
  methods: {
    solicitarQrCode () {
      this.$emit('gerar-novo-qrcode', this.channel)
      this.fecharModalQrModal()
    },
    fecharModalQrModal () {
      this.$emit('update:abrirModalQR', false)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
