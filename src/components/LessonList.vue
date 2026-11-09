<script setup>
import { ref, computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import LessonItem from './LessonItem.vue'
import { useLessons } from '../composables/useLessons.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { formatDuration } from '../utils/duration.js'

const { sortedLessons } = useLessons()
const { types } = useLessonTypes()

// Фільтри: порожній рядок = «усі», тобто за замовчуванням нічого не відфільтровано
const month = ref('')
const typeId = ref('')
const collapsed = ref({}) // { '2026-11': true }

const hasFilters = computed(() => Boolean(month.value || typeId.value))

function resetFilters() {
  month.value = ''
  typeId.value = ''
}

function monthLabel(key) {
  const label = new Date(`${key}-01T00:00:00`).toLocaleDateString('uk-UA', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function dayLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('uk-UA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const monthOptions = computed(() => {
  const keys = [...new Set(sortedLessons().map((l) => l.date.slice(0, 7)))]
  return [{ value: '', label: 'Усі місяці' }, ...keys.map((k) => ({ value: k, label: monthLabel(k) }))]
})

const typeOptions = computed(() => [
  { value: '', label: 'Усі типи' },
  ...types.value.map((t) => ({ value: t.id, label: t.name })),
])

const filtered = computed(() =>
    sortedLessons().filter(
        (l) =>
            (!month.value || l.date.startsWith(month.value)) &&
            (!typeId.value || l.typeId === typeId.value)
    )
)

const priceByType = computed(() => Object.fromEntries(types.value.map((t) => [t.id, Number(t.price) || 0])))

/** Місяць → дні → уроки (порядок уже від нових до старих). */
const groups = computed(() => {
  const months = []
  for (const lesson of filtered.value) {
    const key = lesson.date.slice(0, 7)
    let m = months[months.length - 1]
    if (!m || m.key !== key) {
      m = { key, label: monthLabel(key), days: [], count: 0, hours: 0, earnings: 0 }
      months.push(m)
    }
    let day = m.days[m.days.length - 1]
    if (!day || day.date !== lesson.date) {
      day = { date: lesson.date, label: dayLabel(lesson.date), lessons: [] }
      m.days.push(day)
    }
    day.lessons.push(lesson)
    m.count += 1
    m.hours += Number(lesson.hours) || 0
    m.earnings += priceByType.value[lesson.typeId] || 0
  }
  return months
})

const total = computed(() => ({
  count: filtered.value.length,
  hours: filtered.value.reduce((s, l) => s + (Number(l.hours) || 0), 0),
}))

function toggle(key) {
  collapsed.value = { ...collapsed.value, [key]: !collapsed.value[key] }
}
</script>

<template>
  <div class="lessons">
    <div v-if="sortedLessons().length" class="lessons__filters">
      <BaseSelect v-model="month" label="Місяць" :options="monthOptions" />
      <BaseSelect v-model="typeId" label="Тип" :options="typeOptions" />
    </div>

    <div v-if="hasFilters" class="lessons__summary">
      <span>Знайдено: {{ total.count }} · {{ formatDuration(total.hours) }}</span>
      <BaseButton variant="ghost" @click="resetFilters">Скинути</BaseButton>
    </div>

    <section v-for="m in groups" :key="m.key" class="month">
      <button class="month__header" :aria-expanded="!collapsed[m.key]" @click="toggle(m.key)">
        <span class="month__chevron" :class="{ 'month__chevron--closed': collapsed[m.key] }">▾</span>
        <span class="month__title">{{ m.label }}</span>
        <span class="month__meta">
          {{ m.count }} ур. · {{ formatDuration(m.hours) }}
          <template v-if="m.earnings"> · {{ m.earnings.toFixed(0) }} ₴</template>
        </span>
      </button>

      <div v-show="!collapsed[m.key]" class="month__body">
        <div v-for="day in m.days" :key="day.date" class="day">
          <div class="day__label">{{ day.label }}</div>
          <ul class="day__lessons">
            <LessonItem v-for="lesson in day.lessons" :key="lesson.id" :lesson="lesson" />
          </ul>
        </div>
      </div>
    </section>

    <p v-if="!sortedLessons().length" class="lessons__empty">
      Поки що немає жодного запису. Натисни «+», щоб додати перший урок.
    </p>
    <p v-else-if="!filtered.length" class="lessons__empty">За цими фільтрами уроків немає.</p>
  </div>
</template>

<style scoped>
.lessons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lessons__filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.lessons__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.lessons__empty {
  color: var(--color-ink-soft);
  text-align: center;
  padding: 2rem 1rem;
  margin: 0;
}

.month {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.month__header {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: none;
  background: var(--color-accent-soft);
  color: var(--color-ink);
  text-align: left;
  cursor: pointer;
}

.month__chevron {
  color: var(--color-accent);
  transition: transform 0.15s ease;
}

.month__chevron--closed {
  transform: rotate(-90deg);
}

.month__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
}

.month__meta {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-ink-soft);
  white-space: nowrap;
}

.month__body {
  padding: 0 1rem;
}

.day {
  display: grid;
  grid-template-columns: 4.2rem 1fr;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--color-border);
}

.day:last-child {
  border-bottom: none;
}

.day__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-ink);
  padding-top: 0.6rem;
}

.day__lessons {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>