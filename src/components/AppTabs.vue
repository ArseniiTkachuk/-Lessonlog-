<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: {
    // [{ value, label }]
    type: Array,
    required: true,
  },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <nav class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tabs__item"
      :class="{ 'tabs__item--active': modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.tabs__item {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.55rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-ink-soft);
  cursor: pointer;
}

.tabs__item--active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
