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
      :rules="[val => dateIsValid(val) || '¡Fecha inválida!']"
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
              :value="cQDateDatePart"
              today-btn
              mask="DD/MM/YYYY"
              @input="updateDate"
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
              :value="cQDateTimePart"
              mask="HH:mm"
              format24h
              @input="updateTime"
            >
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  label="Cerrar"
                  color="primary"
                  flat
                />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>

      <!-- Aceptar Demás Slots -->
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

export default {
  name: 'ccInputDateTime',
  extends: singleErrorExtractorMixin,
  inheritAttrs: false,
  data () {
    return {
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
      default: 'NI'
    },
    errorMessage: {
      type: [String, Boolean, Number],
      default: ''
    },
    classAtrrs: {
      type: String,
      default: ''
    },
    icon: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    initValue (v) {
      this.formatInitialDate(v)
    }
  },
  computed: {
    cValue () {
      if (this.value) {
        return this.formatDate(this.value, 'dd/MM/yyyy HH:mm')
      } else if (this.dateSelect) {
        return this.formatDate(this.dateSelect, 'dd/MM/yyyy HH:mm')
      }
      return null
    },
    cQDateDatePart () {
      if (this.cValue) {
        return this.cValue.split(' ')[0]
      }
      return format(new Date(), 'dd/MM/yyyy', { locale: es })
    },
    cQDateTimePart () {
      if (this.cValue) {
        return this.cValue.split(' ')[1]
      }
      return format(new Date(), 'HH:mm', { locale: es })
    },
    cError () {
      return this.error === 'NI' ? this.hasErrors : this.error
    },
    cErrorMessage () {
      return this.errorMessage === '' ? this.firstErrorMessage : this.errorMessage
    },
    iconElement: {
      cache: false,
      get () {
        const defaultConfig = { name: null, size: '24px', color: '#000' }
        return { ...defaultConfig, ...this.icon }
      }
    }
  },
  methods: {
    formatDate (date, fmt) {
      const parsed = typeof date === 'string'
        ? parse(date, 'yyyy-MM-dd HH:mm', new Date())
        : date
      return isValid(parsed) ? format(parsed, fmt, { locale: es }) : ''
    },
    emitFullDate (dateStr) {
      const parsed = parse(dateStr, 'dd/MM/yyyy HH:mm', new Date())
      if (isValid(parsed)) {
        const formatted = format(parsed, 'yyyy-MM-dd HH:mm', { locale: es })
        this.$emit('input', formatted)
        this.$emit('update:date', dateStr)
      }
    },
    updateDate (newDate) {
      const timePart = this.cQDateTimePart || '00:00'
      const combined = `${newDate} ${timePart}`
      this.emitFullDate(combined)
      this.$refs.qDateProxy.hide()
    },
    updateTime (newTime) {
      const datePart = this.cQDateDatePart || format(new Date(), 'dd/MM/yyyy', { locale: es })
      const combined = `${datePart} ${newTime}`
      this.emitFullDate(combined)
      this.$refs.qTimeProxy.hide()
    },
    dateIsValid (val) {
      const parsed = parse(val, 'dd/MM/yyyy HH:mm', new Date())
      return val ? isValid(parsed) : true
    },
    formatInitialDate (value) {
      if (value) {
        this.dateSelect = value
      }
    }
  }
}
</script>

<style scoped>
</style>
