<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | ghost | danger
  },
  type: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <button :type="type" class="base-button" :class="`base-button--${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.08s ease, background 0.15s ease;
}

.base-button:active {
  transform: scale(0.98);
}

.base-button--primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.base-button--primary:hover {
  background: var(--color-accent-hover);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-ink-soft);
  border: 1px solid var(--color-border);
}

.base-button--ghost:hover {
  background: var(--color-surface);
  color: var(--color-ink);
}

.base-button--danger {
  background: transparent;
  color: var(--color-danger);
}

.base-button--danger:hover {
  background: var(--color-danger-soft);
}
</style>