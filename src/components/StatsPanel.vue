<script setup>
import { ref, computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
import ChartPanel from './ChartPanel.vue'
import { useLessons } from '../composables/useLessons.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { formatDuration } from '../utils/duration.js'

const { lessons } = useLessons()
const { types } = useLessonTypes()

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

const selectedMonth = ref(currentMonthKey())

const monthOptions = computed(() => {
  const keys = new Set(lessons.value.map((l) => l.date.slice(0, 7)))
  keys.add(currentMonthKey())
  return [...keys]
    .sort()
    .reverse()
    .map((key) => {
      const [y, m] = key.split('-')
      const label = new Date(`${key}-01`).toLocaleDateString('uk-UA', {
        month: 'long',
        year: 'numeric',
      })
      return { value: key, label: label.charAt(0).toUpperCase() + label.slice(1) }
    })
})

const lessonsInMonth = computed(() =>
  lessons.value.filter((l) => l.date.startsWith(selectedMonth.value))
)

const statsByType = computed(() =>
  types.value.map((type) => {
    const typeLessons = lessonsInMonth.value.filter((l) => l.typeId === type.id)
    const hours = typeLessons.reduce((sum, l) => sum + Number(l.hours), 0)
    const count = typeLessons.length
    const earnings = count * (Number(type.price) || 0)
    return { ...type, hours, count, earnings }
  })
)

const totalHours = computed(() => statsByType.value.reduce((sum, t) => sum + t.hours, 0))
const totalEarnings = computed(() => statsByType.value.reduce((sum, t) => sum + t.earnings, 0))
</script>

<template>
  <div class="stats">
    <BaseSelect v-model="selectedMonth" label="Місяць" :options="monthOptions" />

    <div class="stats__cards">
      <article v-for="type in statsByType" :key="type.id" class="stats__card">
        <h3>{{ type.name }}</h3>
        <dl>
          <div class="stats__row">
            <dt>Уроків</dt>
            <dd>{{ type.count }}</dd>
          </div>
          <div class="stats__row">
            <dt>Час</dt>
            <dd>{{ formatDuration(type.hours) }}</dd>
          </div>
          <div class="stats__row" v-if="type.price">
            <dt>Заробіток</dt>
            <dd>{{ type.earnings.toFixed(0) }} ₴</dd>
          </div>
        </dl>
      </article>
    </div>

    <div class="stats__total">
      <div>
        <span class="stats__total-label">Разом часу</span>
        <strong>{{ formatDuration(totalHours) }}</strong>
      </div>
      <div>
        <span class="stats__total-label">Разом заробіток</span>
        <strong>{{ totalEarnings.toFixed(0) }} ₴</strong>
      </div>
    </div>
    <ChartPanel />
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.stats__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.stats__card h3 {
  font-size: 1rem;
  margin-bottom: 0.6rem;
}

.stats__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  padding: 0.15rem 0;
}

.stats__row dd {
  margin: 0;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.stats__total {
  display: flex;
  justify-content: space-between;
  background: var(--color-warm-soft);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.stats__total-label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
  margin-bottom: 0.2rem;
}

.stats__total strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-warm);
}
</style>
