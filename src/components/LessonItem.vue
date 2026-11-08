<script setup>
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { useLessons } from '../composables/useLessons.js'
import { formatDuration } from '../utils/duration.js'

const props = defineProps({
  lesson: { type: Object, required: true },
})

const { getTypeById } = useLessonTypes()
const { removeLesson } = useLessons()

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <li class="lesson-item">
    <div class="lesson-item__date">{{ formatDate(lesson.date) }}</div>
    <div class="lesson-item__main">
      <span class="lesson-item__type">{{ getTypeById(lesson.typeId)?.name ?? '—' }}</span>
      <span v-if="lesson.note" class="lesson-item__note">{{ lesson.note }}</span>
    </div>
    <div class="lesson-item__hours">{{ formatDuration(lesson.hours) }}</div>
    <button class="lesson-item__remove" aria-label="Видалити" @click="removeLesson(lesson.id)">
      ✕
    </button>
  </li>
</template>

<style scoped>
.lesson-item {
  display: grid;
  grid-template-columns: 3.2rem 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.lesson-item__date {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.lesson-item__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.lesson-item__type {
  font-weight: 500;
}

.lesson-item__note {
  font-size: 0.82rem;
  color: var(--color-ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-item__hours {
  font-variant-numeric: tabular-nums;
  color: var(--color-ink-soft);
}

.lesson-item__remove {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  opacity: 0.6;
}

.lesson-item__remove:hover {
  opacity: 1;
  color: var(--color-danger);
}
</style>
