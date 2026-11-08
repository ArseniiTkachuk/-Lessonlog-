<script setup>
import { ref } from 'vue'
import AppTabs from './components/AppTabs.vue'
import LessonList from './components/LessonList.vue'
import LessonForm from './components/LessonForm.vue'
import StatsPanel from './components/StatsPanel.vue'
import TypeSettings from './components/TypeSettings.vue'

const activeTab = ref('lessons')
const isFormOpen = ref(false)

const tabs = [
  { value: 'lessons', label: 'Уроки' },
  { value: 'stats', label: 'Статистика' },
  { value: 'settings', label: 'Налаштування' },
]
</script>

<template>
  <div class="app">
    <header class="app__header">
      <h1>LessonLog</h1>
    </header>

    <AppTabs v-model="activeTab" :tabs="tabs" />

    <main class="app__content">
      <LessonList v-if="activeTab === 'lessons'" />
      <StatsPanel v-else-if="activeTab === 'stats'" />
      <TypeSettings v-else-if="activeTab === 'settings'" />
    </main>

    <Transition name="sheet">
      <div v-if="isFormOpen" class="app__overlay" @click.self="isFormOpen = false">
        <LessonForm @close="isFormOpen = false" />
      </div>
    </Transition>

    <button
      v-if="activeTab === 'lessons' && !isFormOpen"
      class="app__fab"
      aria-label="Додати урок"
      @click="isFormOpen = true"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.app {
  padding: 1.25rem 1.1rem 6rem;
  min-height: 100vh;
}

.app__header {
  padding: 0.5rem 0 1.25rem;
}

.app__content {
  margin-top: 1.25rem;
}

.app__fab {
  position: fixed;
  right: 1.5rem;
  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: none;
  background: var(--color-accent);
  color: white;
  font-size: 1.8rem;
  line-height: 1;
  box-shadow: 0 6px 16px rgba(31, 42, 36, 0.25);
  cursor: pointer;
}

.app__fab:active {
  transform: scale(0.95);
}

.app__overlay {
  position: fixed;
  inset: 0;
  background: rgba(31, 42, 36, 0.35);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.15s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
