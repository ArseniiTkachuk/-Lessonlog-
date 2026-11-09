<script setup>
import { ref, computed } from 'vue'
import AppTabs from './AppTabs.vue'
import { useLessons } from '../composables/useLessons.js'
import { formatDuration } from '../utils/duration.js'
import { lastMonthKeys } from '../utils/date.js'

const { lessons, lessonPrice } = useLessons()

const metric = ref('earnings') // 'earnings' | 'hours'
const metricTabs = [
  { value: 'earnings', label: 'Заробіток' },
  { value: 'hours', label: 'Години' },
]

function monthShortLabel(key) {
  const label = new Date(`${key}-01T00:00:00`).toLocaleDateString('uk-UA', { month: 'short' })
  return label.replace('.', '')
}

const chartData = computed(() => {
  return lastMonthKeys().map((key) => {
    const monthLessons = lessons.value.filter((l) => l.date.startsWith(key))
    const earnings = monthLessons.reduce((sum, l) => sum + lessonPrice(l), 0)
    const hours = monthLessons.reduce((sum, l) => sum + Number(l.hours), 0)
    return { key, label: monthShortLabel(key), earnings, hours }
  })
})

const values = computed(() => chartData.value.map((m) => m[metric.value]))
const maxValue = computed(() => Math.max(1, ...values.value))

function barHeight(value) {
  return Math.round((value / maxValue.value) * 100)
}

function formatValue(value) {
  return metric.value === 'earnings' ? `${value.toFixed(0)} ₴` : formatDuration(value)
}
</script>

<template>
  <div class="chart">
    <AppTabs v-model="metric" :tabs="metricTabs" />

    <div class="chart__bars">
      <div v-for="month in chartData" :key="month.key" class="chart__col">
        <span class="chart__value">{{ formatValue(month[metric]) }}</span>
        <div class="chart__track">
          <div
              class="chart__bar"
              :class="{ 'chart__bar--empty': month[metric] === 0 }"
              :style="{ height: barHeight(month[metric]) + '%' }"
          />
        </div>
        <span class="chart__label">{{ month.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart__bars {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: end;
  gap: 0.6rem;
  height: 11rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 0.75rem 0.75rem;
}

.chart__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart__value {
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  margin-bottom: 0.3rem;
  white-space: nowrap;
}

.chart__track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart__bar {
  width: 60%;
  min-height: 2px;
  background: var(--color-accent);
  border-radius: 4px 4px 0 0;
  transition: height 0.2s ease;
}

.chart__bar--empty {
  background: var(--color-border);
}

.chart__label {
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}
</style>