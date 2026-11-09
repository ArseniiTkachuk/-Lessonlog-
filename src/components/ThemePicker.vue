<script setup>
import BaseSelect from './BaseSelect.vue'
import { useTheme } from '../composables/useTheme.js'

const { theme } = useTheme()

const options = [
  { value: 'auto', label: 'Як у системі' },
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
]
</script>

<template>
  <div class="theme-picker">
    <h2>Вигляд</h2>
    <BaseSelect v-model="theme" label="Тема" :options="options" />
  </div>
</template>

<style scoped>
.theme-picker {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
</style>