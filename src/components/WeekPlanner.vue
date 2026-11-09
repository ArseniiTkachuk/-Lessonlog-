<script setup>
import { ref, computed } from 'vue'
import BaseButton from './BaseButton.vue'
import { useSchedule } from '../composables/useSchedule.js'
import { useLessons } from '../composables/useLessons.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { formatDuration } from '../utils/duration.js'
import { addDays, startOfWeek, toISODate, formatDayLabel } from '../utils/date.js'

const { slots, dismissed, dismiss } = useSchedule()
const { lessons, addLessons, todayISO } = useLessons()
const { types, getTypeById } = useLessonTypes()

const today = todayISO()

// Дати поточного тижня Пн–Нд; індекс + 1 = номер дня тижня
const weekDates = computed(() => {
  const monday = startOfWeek(new Date())
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)))
})

// Уже створені з розкладу уроки не пропонуємо вдруге
const createdKeys = computed(() => new Set(lessons.value.map((l) => l.scheduleKey).filter(Boolean)))

const items = computed(() => {
  const result = []
  weekDates.value.forEach((date, i) => {
    for (const slot of slots.value.filter((s) => s.weekday === i + 1)) {
      const type = getTypeById(slot.typeId)
      if (!type) continue
      const key = `${slot.id}@${date}`
      if (createdKeys.value.has(key) || dismissed.value.includes(key)) continue
      result.push({ key, date, slot, type, isFuture: date > today })
    }
  })
  return result
})

// Позначки: за замовчуванням позначені уроки за сьогодні й минулі дні
const checked = ref({})

function isChecked(item) {
  return checked.value[item.key] ?? !item.isFuture
}

function toggle(item) {
  checked.value = { ...checked.value, [item.key]: !isChecked(item) }
}

const selectedCount = computed(() => items.value.filter(isChecked).length)
const canApply = computed(
    () => selectedCount.value > 0 || items.value.some((i) => !isChecked(i) && !i.isFuture)
)
const applyLabel = computed(() =>
    selectedCount.value > 0 ? `Додати вибрані (${selectedCount.value})` : 'Пропустити відзначені'
)

function chipStyle(type) {
  const idx = Math.max(0, types.value.findIndex((t) => t.id === type.id))
  return { '--chip-hue': (idx * 67 + 150) % 360 }
}

function apply() {
  for (const item of items.value) {
    if (isChecked(item)) {
      addLessons(
          {
            date: item.date,
            typeId: item.type.id,
            hours: item.type.duration,
            note: item.slot.note,
            price: item.type.price,
            scheduleKey: item.key,
          },
          item.slot.count
      )
    } else if (!item.isFuture) {
      dismiss(item.key) // користувач підтвердив, що уроку не було
    }
  }
  checked.value = {}
}
</script>

<template>
  <section v-if="items.length" class="planner">
    <header class="planner__header">
      <h2>За розкладом цього тижня</h2>
      <span class="planner__badge">{{ items.length }}</span>
    </header>

    <ul class="planner__list">
      <li v-for="item in items" :key="item.key">
        <label class="planner__item" :class="{ 'planner__item--future': item.isFuture }">
          <input type="checkbox" :checked="isChecked(item)" @change="toggle(item)" />
          <span class="planner__day">{{ formatDayLabel(item.date) }}</span>
          <span class="planner__chip" :style="chipStyle(item.type)">{{ item.type.name }}</span>
          <span v-if="item.slot.count > 1" class="planner__times">× {{ item.slot.count }}</span>
          <span class="planner__note">{{ item.slot.note }}</span>
          <span class="planner__hours">{{ formatDuration(item.type.duration) }}</span>
        </label>
      </li>
    </ul>

    <p class="planner__hint">
      Зніміть позначку з уроків, яких не було: за минулі дні їх буде пропущено, а майбутні залишаться
      у списку.
    </p>
    <BaseButton :disabled="!canApply" @click="apply">{{ applyLabel }}</BaseButton>
  </section>
</template>

<style scoped>
.planner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-warm-soft);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.planner__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.planner__header h2 {
  font-size: 1.05rem;
}

.planner__badge {
  background: var(--color-warm);
  color: var(--color-on-accent);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
}

.planner__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.planner__item {
  display: grid;
  grid-template-columns: auto 4.4rem auto auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
}

.planner__item--future {
  opacity: 0.6;
}

.planner__item input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--color-accent);
}

.planner__day {
  font-size: 0.85rem;
  font-weight: 500;
}

.planner__chip {
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
  background: hsl(var(--chip-hue) 40% var(--chip-bg-l));
  color: hsl(var(--chip-hue) 45% var(--chip-fg-l));
}

.planner__times {
  font-size: 0.85rem;
  font-weight: 500;
}

.planner__note {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.planner__hours {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  font-variant-numeric: tabular-nums;
}

.planner__hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
}
</style>