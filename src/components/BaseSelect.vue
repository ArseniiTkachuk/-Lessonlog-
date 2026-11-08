<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  options: {
    // [{ value, label }]
    type: Array,
    required: true,
  },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="base-field">
    <span v-if="label" class="base-field__label">{{ label }}</span>
    <select
      class="base-field__select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.base-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.base-field__label {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.base-field__select {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
}

.base-field__select:focus {
  border-color: var(--color-accent);
}
</style>
