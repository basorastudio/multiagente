<template>
  <div>
    <q-item>
      <q-item-section avatar>
        <q-icon v-if="item.status == 'qrcode'"
          color="primary"
          name="mdi-crop-free"
          size="2.5em" />
        <q-icon v-if="item.status == 'DISCONNECTED'"
          color="negative"
          size="2.5em"
          name="mdi-wifi-alert" />
        <q-icon name="mdi-wifi-arrow-up-down"
          color="green-8"
          size="2.5em"
          v-if="item.status == 'CONNECTED'" />
        <q-icon v-if="['PAIRING', 'TIMEOUT'].includes(item.status)"
          color="negative"
          size="2.5em"
          name="mdi-wifi-strength-1-alert" />
        <q-spinner v-if="item.status == 'OPENING'"
          color="green-7"
          size="3em"
          :thickness="2" />
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="item.status == 'qrcode'">
          <span class="text-weight-medium"> Esperando lectura del QR Code </span>
          <span class="row col"> Haga clic en el botón 'QR CODE' y lea el QR Code con su teléfono para iniciar la sesión
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'DISCONNECTED'">
          <span class="text-weight-medium"> Fallo al iniciar comunicación para este canal. </span>
          <span class="row col"
            v-if="item.type === 'whatsapp'"> Asegúrese de que su teléfono esté conectado a internet e intente
            nuevamente, o solicite un nuevo QR Code </span>
          <span class="row col"
            v-if="item.type === 'telegram'"> Intente conectar nuevamente. Si el error persiste, confirme si el token está
            correcto.</span>
          <span class="row col"
            v-if="item.type === 'instagram'"> Intente conectar nuevamente. Si el error persiste, confirme si las
            credenciales son correctas.</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED'">
          <span class="text-weight-medium"> ¡Conexión establecida! </span>
        </q-item-label>
        <q-item-label v-if="['PAIRING', 'TIMEOUT'].includes(item.status)">
          <span class="text-weight-medium"> Se perdió la conexión con el teléfono </span>
          <span class="row col"> Asegúrese de que su teléfono esté conectado a internet y WhatsApp esté
            abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo QR Code </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'OPENING'">
          <span class="text-weight-medium"> Estableciendo conexión. </span>
          <span class="row col"> Esto podría demorar un poco... </span>
        </q-item-label>
        <q-item-label caption>
          Última Actualización: {{ formatarData(item.updatedAt, 'dd/MM/yyyy HH:mm') }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>
<script>
import { format, parseISO } from 'date-fns'
import es from 'date-fns/locale/es/index'

export default {
  name: 'ItemStatusChannel',
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: es })
    }
  }
}
</script>
