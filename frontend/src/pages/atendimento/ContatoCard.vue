<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Contacto</div>
    </q-card-section>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label>Nombre: {{ contact.name }}</q-item-label>
          <q-item-label>Número: {{ contact.number }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Editar" @click="editContact" />
      <q-btn flat label="Descargar" @click="downloadContact" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: 'ContatoCard',
  props: {
    mensagem: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      parsedContact: {}
    }
  },
  methods: {
    parseVCard (vcard) {
      const lines = vcard.split('\n')
      const contact = {
        name: '',
        number: '',
        photo: ''
      }
      lines.forEach(line => {
        if (line.startsWith('FN:')) {
          contact.name = line.substring(3)
        } else if (line.startsWith('TEL') || line.includes('.TEL')) {
          contact.number = line.split(':')[1]
        } else if (line.startsWith('PHOTO;BASE64')) {
          contact.photo = line.split(':')[1]
        }
      })
      return contact
    },
    addContact (contact) {
      this.$emit('openContactModal', contact)
    }
  },
  mounted () {
    this.parsedContact = this.parseVCard(this.mensagem.body)
  }
}
</script>

<style scoped>
.contact-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  border-radius: 8px;
  background: #f9f9f9;
}
.contact-card img {
  max-width: 100px;
  border-radius: 50%;
}
</style>
