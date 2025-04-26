<template>
  <q-dialog v-model="isVisible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Añadir Contacto</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="localContact.name" label="Nombre" />
        <q-input v-model="localContact.number" label="Número" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="close" />
        <q-btn flat label="Guardar" color="primary" @click="saveContact" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ContatoModal',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    contact: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isVisible: this.value,
      localContact: { ...this.contact }
    }
  },
  watch: {
    value (newVal) {
      this.isVisible = newVal
    },
    contact (newContact) {
      this.localContact = { ...newContact }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    saveContact () {
      // Aquí puedes añadir la lógica para guardar el contacto
      this.$emit('saveContact', this.localContact)
      this.close()
    }
  }
}
</script>
