<template>
  <q-dialog v-model="showModal" persistent>
    <q-card :style="modalStyle">
      <!-- Información del contacto en la parte superior -->
      <q-card-section>
        <div class="contact-info">
          <strong>Ticket:</strong> {{ ticketId }}<br />
        </div>
      </q-card-section>

      <!-- Historial de mensajes -->
      <q-card-section class="chat-history">
        <!-- Botón para cargar más mensajes en la parte superior, si hasMore es true -->
        <div v-if="hasMore" class="load-more-container">
          <q-btn label="Cargar más" @click="carregarMensagens(ticketId, pageNumber + 1)" />
        </div>

        <div v-if="mensagens.length" class="messages-container">
          <div
            v-for="mensagem in mensagensOrdenadas"
            :key="mensagem.id"
            class="chat-message"
            :class="{ 'from-me': mensagem.fromMe, 'from-them': !mensagem.fromMe }"
          >
            <div class="message-meta">
              <strong>
                {{ mensagem.sendType === 'bot' ? 'Bot' : (mensagem.fromMe ? 'Atendente' : mensagem.from) }}
              </strong>&nbsp;&nbsp;
              <span>{{ formatarData(mensagem.createdAt) }}</span>
            </div>
            <div class="message-body">
              <div v-if="!mensagem.mediaUrl">{{ mensagem.body }}</div>
              <!-- Verifica se mediaUrl não é null e exibe a imagem -->
              <div v-if="mensagem.mediaUrl" class="image-container">
                <img :src="removePort(mensagem.mediaUrl)" alt="Media" class="message-media" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No se encontraron mensajes.</p>
        </div>
      </q-card-section>

      <!-- Botão de fechar o chat -->
      <q-card-actions align="right">
        <q-btn label="Cerrar" color="negative" @click="closeModal" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { LocalizarMensagens } from 'src/service/tickets'

export default {
  props: {
    ticketId: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      showModal: true,
      mensagens: [],
      pageNumber: 1,
      hasMore: true
    }
  },
  computed: {
    modalStyle () {
      return {
        minWidth: '70vw',
        maxWidth: '70vw',
        minHeight: '60vh',
        maxHeight: '80vh'
      }
    },
    // Ordena los mensajes por fecha (del más antiguo al más reciente)
    mensagensOrdenadas () {
      return this.mensagens.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
  },
  methods: {
    removePort (url) {
      if (!url) return url
      return url.replace(/:443/, '')
    },
    async carregarMensagens (ticketId, pageNumber = 1) {
      try {
        // Bucle para paginar hasta que no haya más páginas (hasMore == false)
        while (this.hasMore) {
          const { data } = await LocalizarMensagens({ ticketId: String(ticketId), pageNumber })

          if (data && data.messages.length > 0) {
            // Filtrar solo los mensajes con el ticketId correcto
            const mensagensFiltradas = data.messages.filter(m => m.ticketId === Number(ticketId))

            // Si encontró algún mensaje, agrega al array de mensajes
            if (mensagensFiltradas.length > 0) {
              this.mensagens = [...this.mensagens, ...mensagensFiltradas]
            }
          }

          // Atualizar o estado de hasMore e incrementar o pageNumber
          this.hasMore = data.hasMore

          // Incrementar o pageNumber independentemente de ter encontrado mensagens ou não
          pageNumber++

          // Caso não tenha mais páginas para carregar
          if (!this.hasMore) {
            break
          }
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
      }
    },
    formatarData (data) {
      return new Date(data).toLocaleString()
    },
    closeModal () {
      this.showModal = false
      this.$emit('close')
    }
  },
  mounted () {
    this.carregarMensagens(this.ticketId)
  }
}
</script>

<style scoped>
.message-body {
  padding: 10px;
  border-radius: 8px;
  max-width: 100%;
  word-wrap: break-word;
}

.image-container {
  margin-top: 10px;
  text-align: center;
}

.message-media {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 5px;
}
/* Ajustes visuais gerais */
.q-dialog {
  min-width: 70vw;
  max-width: 70vw;
  min-height: 60vh;
  max-height: 80vh;
}

.contact-info {
  font-size: 1.2em;
  margin-bottom: 10px;
}

/* Estilos para o histórico de mensagens */
.chat-history {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow-y: auto;
}

/* Container das mensagens */
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Estilos para mensagens */
.chat-message {
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
  word-wrap: break-word;
  font-size: 1em;
}

/* Mensagens enviadas pelo usuário (direita) */
.from-me {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

/* Mensagens enviadas pelo cliente (esquerda) */
.from-them {
  background-color: #f1f1f1;
  color: black;
  align-self: flex-start;
}

/* Metadados da mensagem (remetente e data) */
.message-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  margin-bottom: 5px;
}

/* Corpo da mensagem */
.message-body {
  font-size: 1em;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Botão de carregar mais mensagens */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

/* Ajustes para o botão de fechar */
.q-card-actions {
  margin-top: 10px;
}
</style>
