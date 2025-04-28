<template>
  <div>
    <q-input
      class="full-width"
      hide-bottom-space
      outlined
      stack-label
      type="text"
      mask="##/##/#### ##:##"
      fill-mask
      bottom-slots
      v-bind="$attrs"
      :class="classAtrrs"
      :value="cValue"
      v-on="$listeners"
      :error="cError"
      :error-message="cErrorMessage"
      :ruler="[val => dateIsValid(val) || '¡Fecha inválida!' ]"
    >
      <template v-slot:prepend>
        <q-icon
          name="event"
          class="cursor-pointer q-mr-sm"
        >
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              :value="cQDate"
              today-btn
              mask="DD/MM/YYYY HH:mm"
              @input="emitDate"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
      <template v-slot:append>
        <q-icon
          name="access_time"
          class="cursor-pointer"
        >
          <q-popup-proxy
            ref="qTimeProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-time
              :value="cQDate"
              @input="emitDate"
              mask="DD/MM/YYYY HH:mm"
              format24h
            >
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  label="Close"
                  color="primary"
                  flat
                />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
      <!-- Aceitar Demais Slot's -->
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>
    </q-input>
  </div>
</template>
<script>
import { singleErrorExtractorMixin } from 'vuelidate-error-extractor'
import { format, parse, isValid } from 'date-fns'
import es from 'date-fns/locale/es'
// Importación del locale español para date-fns

export default {
  name: 'ccInputDateTime',
  extends: singleErrorExtractorMixin,
  inheritAttrs: false,
  data () {
    return {
      date: null,
      dateSelect: null
    }
  },
  props: {
    value: [String, Date],
    initValue: {
      type: [String, Date],
      default: null
    },
    error: {
      type: [String, Boolean, Number],
      default: 'NI' // Não Informada
    },
    errorMessage: {
      type: [String, Boolean, Number],
      default: '' // Não Informada
    },
    classAtrrs: {
      type: String,
      default: () => ''
    },
    icon: {
      type: Object,
      default: () => { }
    }
  },
  watch: {
    initValue (v) {
      this.dateFormated(v)
    }
  },
  computed: {
    cValue () {
      // Formateo de fecha adaptado a locale español
return this.value ? this.value : this.dateSelect ? format(parse(this.dateSelect, 'dd/MM/yyyy HH:mm', new Date(), { locale: es }), 'yyyy-MM-dd HH:mm', { locale: es }) : null
    },
    cQDate () {
      if (isValid(this.cValue)) {
        // Formateo consistente con locale español
return format(this.cValue, 'dd/MM/yyyy HH:mm', { locale: es })
      }
      // Manejo de fechas con validación y locale español
return this.cValue ? format(parse(this.cValue, 'yyyy-MM-dd HH:mm', new Date(), { locale: es }), 'dd/MM/yyyy HH:mm', { locale: es }) : format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })
    },
    cError () {
      if (this.error == 'NI') {
        return this.hasErrors
      }
      return this.error
    },
    cErrorMessage () {
      if (this.errorMessage == '') {
        return this.firstErrorMessage
      }
      return this.errorMessage
    },
    iconElment: {
      cache: false,
      get () {
        const defaultConfig = { name: null, size: '24px', color: '#000' }
        const data = { ...defaultConfig, ...this.icon }
        if (!data.name) {
          return defaultConfig
        } else {
          return data
        }
      }
    }
  },
  methods: {
    emitDate (d, r, dt) {
      let date = d
      if (!date) {
        const time = format(new Date(), 'HH:mm', { locale: es })
        date = `${dt.day}/${dt.month}/${dt.year} ${time}`
      }
      const parseDate = parse(date, 'dd/MM/yyyy HH:mm', new Date(), { locale: es })
      this.$emit('input', format(parseDate, 'yyyy-MM-dd HH:mm', { locale: es }))
      this.$refs.qDateProxy.hide()
      this.$refs.qTimeProxy.hide()
    },
    dateIsValid (d) {
      return this.cValue ? isValid(d) : true
    }
  }
}
</script>

<style scoped>
</style>
