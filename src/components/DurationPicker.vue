<script setup>
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
import { toHoursAndMinutes, toDecimalHours } from '../utils/duration.js'

const props = defineProps({
  modelValue: { type: [Number, String], default: 1 }, // десяткові години
  label: { type: String, default: 'Тривалість' },
})
const emit = defineEmits(['update:modelValue'])

const hourOptions = Array.from({ length: 9 }, (_, h) => ({
  value: String(h),
  label: `${h} год`,
}))

const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => ({
  value: String(m),
  label: `${m} хв`,
}))

const current = computed(() => toHoursAndMinutes(props.modelValue))

function setHours(value) {
  emit('update:modelValue', toDecimalHours(value, current.value.minutes))
}

function setMinutes(value) {
  emit('update:modelValue', toDecimalHours(current.value.hours, value))
}
</script>

<template>
  <div class="duration-picker">
    <span class="duration-picker__label">{{ label }}</span>
    <div class="duration-picker__row">
      <BaseSelect
        :model-value="String(current.hours)"
        :options="hourOptions"
        @update:model-value="setHours"
      />
      <BaseSelect
        :model-value="String(current.minutes)"
        :options="minuteOptions"
        @update:model-value="setMinutes"
      />
    </div>
  </div>
</template>

<style scoped>
.duration-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.duration-picker__label {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.duration-picker__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
</style>
