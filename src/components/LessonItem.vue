<script setup>
import { computed } from 'vue'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { useLessons } from '../composables/useLessons.js'
import { formatDuration } from '../utils/duration.js'

const props = defineProps({
  lesson: { type: Object, required: true },
})
const emit = defineEmits(['edit'])

const { types, getTypeById } = useLessonTypes()
const { removeLesson } = useLessons()

const type = computed(() => getTypeById(props.lesson.typeId))

// Кожен тип має свій відтінок; світлота береться з теми (style.css)
const chipStyle = computed(() => {
  const idx = Math.max(0, types.value.findIndex((t) => t.id === props.lesson.typeId))
  return { '--chip-hue': (idx * 67 + 150) % 360 }
})
</script>

<template>
  <li
      class="lesson-item"
      tabindex="0"
      role="button"
      aria-label="Редагувати урок"
      @click="emit('edit', lesson)"
      @keydown.enter="emit('edit', lesson)"
  >
    <span class="lesson-item__chip" :style="chipStyle">{{ type?.name ?? '—' }}</span>
    <span class="lesson-item__note">{{ lesson.note }}</span>
    <span class="lesson-item__hours">{{ formatDuration(lesson.hours) }}</span>
    <button class="lesson-item__remove" aria-label="Видалити" @click.stop="removeLesson(lesson.id)">
      ✕
    </button>
  </li>
</template>

<style scoped>
.lesson-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.4rem;
  margin: 0 -0.4rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.lesson-item:hover {
  background: var(--color-accent-soft);
}

.lesson-item__chip {
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
  background: hsl(var(--chip-hue) 40% var(--chip-bg-l));
  color: hsl(var(--chip-hue) 45% var(--chip-fg-l));
}

.lesson-item__note {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.lesson-item__hours {
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.lesson-item__remove {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  opacity: 0.5;
}

.lesson-item__remove:hover {
  opacity: 1;
  color: var(--color-danger);
}
</style>