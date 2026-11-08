<script setup>
import LessonItem from './LessonItem.vue'
import { useLessons } from '../composables/useLessons.js'

const { sortedLessons } = useLessons()
</script>

<template>
  <ul v-if="sortedLessons().length" class="lesson-list">
    <LessonItem v-for="lesson in sortedLessons()" :key="lesson.id" :lesson="lesson" />
  </ul>
  <p v-else class="lesson-list__empty">
    Поки що немає жодного запису. Натисни «+», щоб додати перший урок.
  </p>
</template>

<style scoped>
.lesson-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lesson-list__empty {
  color: var(--color-ink-soft);
  text-align: center;
  padding: 2rem 1rem;
}
</style>
