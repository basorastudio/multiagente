<template>
  <div v-if="userProfile === 'admin'">
    <q-card
      flat
      class="q-ma-sm"
    >
      <q-card-section>
        <div class="row text-h6">
          Campaña: {{ $route.params.campanha.name }}
        </div>
        <div class="row text-caption">
          Inicio: {{ formatDate($route.params.campanha.start) }} - Estado: {{ $route.params.campanha.status }}
        </div>
        <q-btn
          rounded
          class="absolute-top-right q-ma-md"
          icon="mdi-arrow-left"
          label="Listar Campañas"
          color="black"
          @click="$router.push({ name: 'campanhas' })"
        />
      </q-card-section>
    </q-card>
    <q-table
      class="my-sticky-dynamic q-ma-sm"
      title="Contactos"
      id="tabela-contatos-campanha"
      :data="contatosCampanha"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      separator="cell"
    >
      <template v-slot:top>
        <div class="row col-4 q-table__title items-center ">
          Contactos
        </div>
        <q-space />
        <q-btn
          rounded
          class="q-ml-md"
          color="black"
          icon="refresh"
          @click="listarContatosCampanha"
        >
          <q-tooltip>
            Actualizar Listado
          </q-tooltip>
        </q-btn>
        <q-btn
          class="q-ml-md"
          color="negative"
          icon="close"
          outline
          rounded
          label="Limpiar Campaña"
          @click="deletarTodosContatosCampanha"
          v-if="$route.params.campanha.status === 'pending' ||
            $route.params.campanha.status === 'canceled'"
        />
        <q-btn
          class="q-ml-md"
          color="primary"
          label="Incluir Contactos"
          icon="add"
          rounded
          v-if="$route.params.campanha.status === 'pending' ||
            $route.params.campanha.status === 'canceled'"
          @click="modalAddContatosCampanha = !modalAddContatosCampanha"
        />
      </template>
      <template v-slot:body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar style="border: 1px solid #9e9e9ea1 !important">
            <q-icon
              name="mdi-account"
              size="1.5em"
              color="grey-5"
              v-if="!props.value"
            />
            <q-img
              :src="props.value"
              style="max-width: 150px"
            >
              <template v-slot:error>
                <q-icon
                  name="mdi-account"
                  size="1.5em"
                  color="grey-5"
                />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            v-if="$route.params.campanha.status === 'pending'"
            flat
            round
            icon="mdi-delete"
            @click="deletarContatoCampanha(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contatosCampanha.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>

    <q-dialog
      persistent
      v-model="modalAddContatosCampanha"
    >
      <q-card style="min-width: 80vw; width: 80vw">
        <q-card-section class="q-pt-none q-pt-md">
          <fieldset class="rounded-all">
            <legend class="q-px-sm">Filtros (Fecha creación del contacto)</legend>
            <div class="row q-gutter-md items-end">
              <div class="col-grow">
                <label>Inicio</label>
                <DatePick
                  dense
                  rounded
                  v-model="pesquisa.startDate"
                />
              </div>
              <div class="col-grow">
                <label>Final</label>
                <DatePick
                  dense
                  rounded
                  v-model="pesquisa.endDate"
                />
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-select
                  outlined
                  label="Etiqueta (s)"
                  dense
                  rounded
                  v-model="pesquisa.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  dropdown-icon="add"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item
                      v-bind="itemProps"
                      v-on="itemEvents"
                    >
                      <q-item-section>
                        <q-item-label v-html="opt.tag"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox
                          :value="selected"
                          @input="toggleOption(opt)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip
                      dense
                      rounded
                      color="white"
                      text-color="primary"
                      class="q-ma-xs text-body1"
                    >
                      <q-icon
                        :style="`color: ${opt.color}`"
                        name="mdi-pound-box-outline"
                        size="28px"
                        class="q-mr-sm"
                      />
                      {{ opt.tag }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-select
                  outlined
                  rounded
                  label="Cartera"
                  dense
                  v-model="pesquisa.wallets"
                  multiple
                  :options="usuarios"
                  use-chips
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  dropdown-icon="add"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item
                      v-bind="itemProps"
                      v-on="itemEvents"
                    >
                      <q-item-section>
                        <q-item-label v-html="opt.name"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox
                          :value="selected"
                          @input="toggleOption(opt)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-input
                  style="width: 300px"
                  outlined
                  dense
                  rounded
                  v-model="pesquisa.searchParam"
                  clearable
                  placeholder="Filtrar Nombre o Teléfono"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-grow text-right">
                <q-btn
                  class="q-mr-sm"
                  color="primary"
                  rounded
                  label="Generar"
                  icon="refresh"
                  @click="listarAddContatos"
                />
              </div>
            </div>
          </fieldset>
        </q-card-section>
        <q-card-section>
          <q-table
            class="my-sticky-dynamic q-ma-sm"
            style="height: 50vh"
            title="Contactos"
            id="tabela-contatos-campanha"
            :data="contatosAdd"
            :columns="columnsAdd"
            :loading="loading"
            row-key="number"
            selection="multiple"
            :selected.sync="selected"
            :pagination.sync="pagination"
            :rows-per-page-options="[0]"
            separator="cell"
          >
            <template v-slot:top>
              <div class="row col-4 q-table__title items-center ">
                Seleccionar Contactos
              </div>
              <q-space />
              <q-btn
                rounded
                class="q-ml-md"
                color="negative"
                label="Cancelar"
                @click="modalAddContatosCampanha = false"
              />
              <q-btn
                rounded
                class="q-ml-md"
                color="positive"
                icon="save"
                label="Añadir"
                @click="addContatosCampanha"
              />
            </template>
            <template v-slot:body-cell-profilePicUrl="props">
              <q-td>
                <q-avatar style="border: 1px solid #9e9e9ea1 !important">
                  <q-icon
                    name="mdi-account"
                    size="1.5em"
                    color="grey-5"
                    v-if="!props.value"
                  />
                  <q-img
                    :src="props.value"
                    style="max-width: 150px"
                  >
                    <template v-slot:error>
                      <q-icon
                        name="mdi-account"
                        size="1.5em"
                        color="grey-5"
                      />
                    </template>
                  </q-img>
                </q-avatar>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { ListarEtiquetas } from 'src/service/etiquetas'
import { RelatorioContatos } from 'src/service/estatisticas'
import { AdicionarContatosCampanha, DeletarTodosContatosCampanha, ListarContatosCampanha, DeletarContatoCampanha } from 'src/service/campanhas'
import { format, parseISO, sub } from 'date-fns'
import { ListarUsuarios } from 'src/service/user'

export default {
  name: 'ContatosCampanha',
  data () {
    return {
      userProfile: 'user',
      modalAddContatosCampanha: false,
      etiquetas: [],
      usuarios: [],
      pesquisa: {
        startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        ddds: [],
        tags: [],
        wallets: [],
        searchParam: ''
      },
      contatosCampanha: [],
      filter: null,
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      ACK: { // Si ACK == 3 o 4 entonces color verde
        '-1': 'Error',
        0: 'Envío Pendiente',
        1: 'Entrega Pendiente',
        2: 'Recibido',
        3: 'Leído',
        4: 'Reproducido'
      },
      loading: false,
      columns: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        { name: 'name', label: 'Nombre', field: 'name', align: 'left', style: 'width: 300px' },
        { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' },
        {
          name: 'campaignContacts',
          label: 'Estado',
          field: 'campaignContacts',
          align: 'center',
          style: 'width: 200px',
          format: (v) => {
            return v ? this.ACK[v[0].ack] : ''
          }
        },
        {
          name: 'tags',
          label: 'Etiquetas',
          field: 'tags',
          style: 'width: 500px',
          align: 'left',
          format: (v) => {
            if (v) {
              const strs = v.map(i => i.tag)
              return strs.join(', ')
            }
            return ''
          }
        },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ],
      columnsAdd: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        { name: 'name', label: 'Nombre', field: 'name', align: 'left', style: 'width: 300px' },
        { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' },
        {
          name: 'tags',
          label: 'Etiquetas',
          field: 'tags',
          style: 'width: 500px',
          align: 'left',
          format: (v) => {
            if (v) {
              const strs = v.map(i => i.tag)
              return strs.join(', ')
            }
            return ''
          }
        }
      ],
      contatosAdd: [],
      selected: []
    }
  },
  methods: {
    formatDate (date, dateMask = 'dd/MM/yyyy') {
      return format(parseISO(date), dateMask)
    },
    async listarAddContatos () {
      const { data } = await RelatorioContatos(this.pesquisa)
      this.contatosAdd = data.contacts
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    async listarContatosCampanha () {
      const { data } = await ListarContatosCampanha(this.$route.params.campanhaId)
      this.contatosCampanha = data
    },
    async addContatosCampanha () {
      try {
        await AdicionarContatosCampanha(this.selected, this.$route.params.campanhaId)
        this.listarContatosCampanha()
        this.modalAddContatosCampanha = false
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: 'Contactos añadidos.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        this.$notificarErro('¡Ocurrió un error!', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    deletarContatoCampanha (contato) {
      DeletarContatoCampanha(this.$route.params.campanhaId, contato.id)
        .then(res => {
          this.listarContatosCampanha()
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Contacto eliminado de esta campaña',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        })
        .catch(error => {
          console.error(error)
          this.$notificarErro('Verifique los errores...', error)
        })
    },
    deletarTodosContatosCampanha () {
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea eliminar todos los contactos de esta campaña?',
        // message: 'Los mensajes antiguos no se eliminarán en WhatsApp.',
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
      }).onOk(() => {
        DeletarTodosContatosCampanha(this.$route.params.campanhaId)
          .then(res => {
            this.contatosCampanha = []
            this.$notificarSucesso('Contacto eliminado de esta campaña')
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('No se pudo eliminar el contacto de la campaña', error)
          })
      })
    }
  },
  beforeMount () {
    this.listarEtiquetas()
    this.listarUsuarios()
  },
  mounted () {
    this.userProfile = localStorage.getItem('profile')
    const campanhaParams = this.$route.params.campanha
    if (!campanhaParams) {
      this.$router.push({ name: 'campanhas' })
      return
    }
    this.listarContatosCampanha()
  }
}
</script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 75vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px
</style>
