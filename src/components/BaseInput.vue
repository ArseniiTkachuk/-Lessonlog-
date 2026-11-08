<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  step: { type: String, default: null },
  min: { type: String, default: null },
  placeholder: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="base-field">
    <span v-if="label" class="base-field__label">{{ label }}</span>
    <input
      class="base-field__input"
      :type="type"
      :step="step"
      :min="min"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
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

.base-field__input {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-ink);
}

.base-field__input:focus {
  border-color: var(--color-accent);
}
</style>
